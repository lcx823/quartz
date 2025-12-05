import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
        // 以下是新增内容
    Component.Comments({
      provider: 'giscus',
      options: {
        // from data-repo
        repo: 'lcx823/quartz',
        // from data-repo-id
        repoId: 'R_kgDOPwsyeQ',
        // from data-category
        category: 'Announcements',
        // from data-category-id
        categoryId: 'DIC_kwDOPwsyec4Cv2Fj',
        // how to map pages -> discussions
        // defaults to 'url'
        mapping: "pathname",
        // use strict title matching
        // defaults to true
        strict: false,
        // whether to enable reactions for the main post
        // defaults to true
        reactionsEnabled: true,
        // where to put the comment input box relative to the comments
        // defaults to 'bottom'
        inputPosition: "bottom",
        data-theme="preferred_color_scheme",
        data-lang="zh-CN",
        crossorigin="anonymous"
      }
    }),
    // 以上是新增内容
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
      // 以下是新增内容
      "Scroll to top ↑": "#",
       // 以上是新增内容
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
