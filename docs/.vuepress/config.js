import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
 
export default defineUserConfig({
    bundler: viteBundler(),
    theme: defaultTheme({
        // 在这里进行配置
        navbar: [
            // NavbarItem
            { text: '首页', link: '/', },
            // NavbarGroup
            {
                text: 'una的博客',
                children: [
                    { text: 'Github', link: '/' },
                    { text: '知乎', link: '/' },
                    { text: '掘金', link: '/' },
                ],
            },
        ],
    }),
 
    lang: 'zh-CN',
    title: 'una的博客',
    description: '这是我的第一个 VuePress 站点',
})