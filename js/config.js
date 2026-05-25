/**
 * 全局配置中心
 * 统一管理地图 API、CDN 资源及业务参数
 */
const AppConfig = {
    // 地图数据源 (GeoJSON)
    // 优先使用 Aliyun DataV，备选使用 Apache ECharts 官方示例库
    geoSource: {
        national: 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
        province: 'https://geo.datav.aliyun.com/areas_v3/bound/{adcode}_full.json',
        fallback: 'https://cdn.jsdelivr.net/gh/apache/echarts-website@asf-site/examples/data/asset/geo/china.json'
    },

    // 地图服务密钥 (如使用高德/百度地图扩展则需配置)
    // 当前使用 ECharts GeoJSON 模式，无需密钥，保留字段以备后续扩展
    mapKeys: {
        amap: '',
        bmap: '',
        tianditu: ''
    },

    // 默认数据范围
    dataRange: {
        usage: { min: 0, max: 5000 },
        intensity: { min: 0, max: 2.5 }
    },

    // 刷新频率 (毫秒)
    refreshInterval: 10000
};
