/**
 * 斗鱼手机客户端滚动弹幕恢复 - 代理软件重写脚本
 * 
 * 适用于: Shadowrocket (小火箭), Quantumult X, Surge, Loon 等 iOS/Android 代理软件
 * 作用: 拦截斗鱼 API 响应，自动将 JSON 或文本中的弹幕控制字段（如 player_barrage 等）由 0 修改为 1。
 * 
 * 配置说明 (以 Shadowrocket 为例):
 * 1. 开启 HTTPS 解密 (MitM)，并信任证书。
 * 2. 在 [MitM] 中添加域名: *.douyucdn.cn, *.douyu.com
 * 3. 在 [Script] 中添加本地/远程脚本，匹配规则为正则匹配斗鱼的房间配置接口，例如:
 *    ^https?:\/\/.*\.douyucdn\.cn\/api\/v1\/room\/
 *    或者直接匹配 betard 接口:
 *    /betard
 */

let body = $response.body;

if (body) {
    try {
        // 尝试以 JSON 格式解析并递归修改所有匹配的弹幕控制字段
        let obj = JSON.parse(body);

        function modifyBarrageFields(o) {
            if (typeof o !== 'object' || o === null) return;
            for (let key in o) {
                if (o.hasOwnProperty(key)) {
                    // 匹配常见的弹幕开关字段
                    if (
                        key === 'player_barrage' || 
                        key === 'barrage_effect' || 
                        key === 'player_barrage_switch' || 
                        key === 'is_barrage_scrolling'
                    ) {
                        console.log(`[斗鱼弹幕重写] 找到字段 ${key}: ${o[key]}，强制修改为 1`);
                        o[key] = 1;
                    } else if (typeof o[key] === 'object') {
                        modifyBarrageFields(o[key]);
                    }
                }
            }
        }

        modifyBarrageFields(obj);
        body = JSON.stringify(obj);
    } catch (e) {
        // 如果 JSON 解析失败，则回退到正则字符串替换，确保最大兼容性
        console.log("[斗鱼弹幕重写] JSON 解析失败，采用正则字符串替换模式");
        body = body.replace(/"player_barrage"\s*:\s*0/g, '"player_barrage":1');
        body = body.replace(/"barrage_effect"\s*:\s*0/g, '"barrage_effect":1');
        body = body.replace(/"player_barrage_switch"\s*:\s*0/g, '"player_barrage_switch":1');
        body = body.replace(/"is_barrage_scrolling"\s*:\s*0/g, '"is_barrage_scrolling":1');
    }
}

// 返回修改后的响应体给 App
$done({ body: body });
