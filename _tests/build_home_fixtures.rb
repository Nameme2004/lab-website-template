# Creates isolated Jekyll sites; never changes repository members or posts.
require "jekyll"
require "fileutils"
require "tmpdir"
require "yaml"
require "json"

root = File.expand_path("..", __dir__)
output = File.expand_path(ARGV.fetch(0))
FileUtils.mkdir_p(output)
research = YAML.safe_load(File.read(File.join(root, "_data/research.yaml")))
cms = YAML.safe_load(File.read(File.join(root, ".pages.yml")))
research_fields = cms.fetch("content").find { |entry| entry["name"] == "research" }.fetch("fields")
direction_fields = research_fields.find { |field| field["name"] == "directions" }.fetch("fields").map { |field| field["name"] }
ids = research.fetch("directions").map { |direction| direction.fetch("id") }
raise "Research IDs must be unique" unless ids.uniq == ids && ids.none?(&:empty?)
research.fetch("directions").each do |direction|
  raise "CMS is missing nonempty direction fields" unless (direction.keys - direction_fields).empty?
end
File.write(File.join(output, "content-data.json"), JSON.generate({
  "research" => research, "team" => YAML.safe_load(File.read(File.join(root, "_data/team.yaml")))
}))

Dir.mktmpdir("duan-home-fixtures") do |temporary|
  [0, 1, 2, 5].each do |count|
    source = File.join(temporary, count.to_s)
    FileUtils.mkdir_p(source)
    %w[_includes _layouts _styles _scripts _plugins _data images _config.yaml index.md research].each do |name|
      FileUtils.cp_r(File.join(root, name), source)
    end
    posts = File.join(source, "_posts")
    members = File.join(source, "_members")
    FileUtils.mkdir_p([posts, members])
    write_document = lambda do |path, data, body|
      File.write(path, data.to_yaml + "---\n\n" + body + "\n")
    end
    (1..count).each do |index|
      data = { "title" => "Fixture News #{index}", "published" => true,
               "category" => "Fixture", "summary" => "Temporary test summary #{index}.",
               "summary_zh" => "临时测试摘要 #{index}。", "title_zh" => "测试新闻 #{index}" }
      data["image"] = "/images/missing-fixture.jpg" if index == count
      data["image"] = "/images/photo.jpg" if index == 1 && count > 1
      write_document.call(File.join(posts, "2020-01-0#{index}-fixture-news-#{index}.md"), data, "Temporary fixture; not repository news.")
    end
    # A long bilingual title exercises natural height without changing real CMS news.
    if count > 1
      first = File.join(posts, "2020-01-01-fixture-news-1.md")
      document = File.read(first)
      document.sub!("title: Fixture News 1", "title: Fixture News 1 — Exploring collaborative disease modeling and new approaches to organoid research")
      document.sub!("title_zh: 测试新闻 1", "title_zh: 测试新闻 1：探索协作疾病建模与类器官研究新方法的临时长标题布局测试")
      File.write(first, document)
    end
    # Newer hidden, template, future and blank-title posts must not become slides.
    [
      ["2020-02-01-hidden-news.md", { "title" => "Hidden fixture", "published" => false }],
      ["2020-02-02-example-post-1.md", { "title" => "Example fixture", "published" => true }],
      ["2099-01-01-future-news.md", { "title" => "Future fixture", "published" => true }],
      ["2020-02-03-blank-news.md", { "title" => " ", "published" => true }]
    ].each { |name, data| write_document.call(File.join(posts, name), data, "Excluded fixture.") }
    write_document.call(File.join(members, "fixture-member.md"), {
      "name" => "Fixture Member", "role" => "phd", "image" => "images/fallback.svg",
      "links" => { "email" => "fixture@university.edu", "github" => "fixture-lab", "orcid" => "0000-0001-2345-6789" }
    }, "Temporary member, not a real person.")
    write_document.call(File.join(members, "no-email.md"), {
      "name" => "No Email Fixture", "role" => "phd", "image" => "images/fallback.svg",
      "links" => { "email" => "  ", "github" => "fixture-lab" }
    }, "No-email fixture.")
    config = Jekyll.configuration({
      "source" => source, "config" => File.join(source, "_config.yaml"),
      "destination" => File.join(output, count.to_s), "quiet" => true,
      "baseurl" => "/lab-website-template/preview/fixture/#{count}",
      "future" => true, "disable_disk_cache" => true
    })
    Jekyll::Site.new(config).process
  end
end
puts "Built isolated 0/1/2/5-news Jekyll fixtures with excluded-post cases."
