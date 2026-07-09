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
            { text: 'Home', link: '/' },
            { text: '文章', link: '/preface/intro' },
            { text: '类别', link: '/Algorithm/DivideAndConquer' },
            { text: 'Tag', link: '/preface/guide' },
            { text: '时间线', link: '/preface/intro' },
        ],

        // 侧边栏（只在文章页面显示）
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
        footer: '© 2026 xy6f的博客',
        displayFooter: true,

        // 首页不显示侧边栏
        home: true,
    }),
})