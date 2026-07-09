import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { hopeTheme } from 'vuepress-theme-hope'

export default defineUserConfig({
    // 站点基本信息
    title: 'xy6f的博客',
    description: '记录学习与生活，分享技术与思考',
    lang: 'zh-CN',

    // GitHub Pages 部署路径（用户站点设为 /）
    base: '/',

    bundler: viteBundler(),

    theme: hopeTheme({
        // 启用博客功能
        plugins: {
            blog: true,
        },

        // 导航栏
        navbar: [
            '/',
            {
                text: '文章',
                icon: 'pen-to-square',
                link: '/article/',
            },
            {
                text: '类别',
                icon: 'list',
                link: '/category/',
            },
            {
                text: 'Tag',
                icon: 'tag',
                link: '/tag/',
            },
            {
                text: '时间线',
                icon: 'clock-rotate-left',
                link: '/timeline/',
            },
        ],

        // 博客配置
        blog: {
            name: 'xy6f',
            description: '记录学习与生活，分享技术与思考',
            intro: '/preface/intro',
        },

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
        footer: '© 2026 xy6f的博客',
        displayFooter: true,

        // 主页配置
        home: '/home',

        // 文章列表配置
        article: {
            excerptLength: 200,
        },

        // 分类配置
        category: {
            excerptLength: 100,
        },

        // 标签配置
        tag: {
            excerptLength: 100,
        },

        // 时间线配置
        timeline: {
            excerptLength: 100,
        },
    }),
})
