import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'

export default defineUserConfig({
    title: 'xy6f的博客',
    description: '记录学习与生活，分享技术与思考',
    lang: 'zh-CN',
    base: '/',

    head: [
        ['style', {}, `
.vp-home-banner .banner-mask {
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  background-color: rgba(255, 255, 255, 0.15) !important;
}
.dark .vp-home-banner .banner-mask {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.35) !important;
}
.vp-posts .vp-post-item {
  border-radius: 10px;
  margin-bottom: 12px;
  border: 1px solid var(--vp-c-divider, rgba(0,0,0,0.08));
  transition: all 0.3s ease;
}
.vp-posts .vp-post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--vp-c-brand-1, #3a7bd5);
}
.dark .vp-posts .vp-post-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.vp-posts .vp-pagination {
  display: none !important;
}
.vp-posts .vp-posts-nav {
  margin-bottom: 20px;
}
        `],
    ],

    bundler: viteBundler(),

    theme: plumeTheme({
        // 导航栏
        navbar: [
            { text: 'Home', link: '/' },
            { text: '文章列表', link: '/posts/' },
            { text: '关于我', link: '/about/' },
            { text: 'GitHub', link: 'https://github.com/xy6f' },
        ],

        // 页脚
        footer: '© 2026 xy6f的博客',

        // 中文标签
        tagText: '标签',
        categoryText: '分类',
        

        // 博客配置
        blog: {
            listText: '文章列表',
        },

        // 集合配置
        collections: [
            {
                type: 'post',
                dir: 'posts',
                title: '文章列表',
                tagsText: '标签',
                categoriesText: '分类',
                archivesText: '归档',
                pagination: { perPage: 4 },
            },
        ],
    }),
})
