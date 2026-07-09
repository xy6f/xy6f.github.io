import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
    // 站点基本信息
    title: 'xy6f的博客',
    description: '记录学习与生活，分享技术与思考',
    lang: 'zh-CN',

    // GitHub Pages 部署路径（用户站点设为 /）
    base: '/',

    bundler: viteBundler(),

    theme: defaultTheme({
        // 导航栏
        navbar: [
            { text: '首页', link: '/' },
            { text: '前言', link: '/preface/intro' },
            { text: '算法学习', link: '/Algorithm/DivideAndConquer' },
            {
                text: '社交链接',
                children: [
                    { text: 'Github', link: 'https://github.com/' },
                    { text: '知乎', link: 'https://www.zhihu.com/' },
                    { text: '掘金', link: 'https://juejin.cn/' },
                ],
            },
        ],

        // 侧边栏
        sidebar: {
            '/preface/': [
                {
                    text: '前言',
                    collapsible: false,
                    children: [
                        { text: '内容介绍', link: '/preface/intro' },
                        { text: '使用指南', link: '/preface/guide' },
                    ],
                },
            ],
            '/Algorithm/': [
                {
                    text: '算法学习',
                    collapsible: false,
                    children: [
                        { text: '分治法', link: '/Algorithm/DivideAndConquer' },
                    ],
                },
            ],
        },

        // 页脚
        footer: 'xy6f的博客 | MIT Licensed',
        displayFooter: true,
    }),
})