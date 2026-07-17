var $downUrl = "https://cdn.masterummy.com/apk/2000514/MasterRummy.apk"
var $fb_pixel_id = "1300103924998616"
var $fb_access_token = "EAAYPlKEq3TQBRvZA5GCpJpbYjSoSMDJWrXJbYBifKkmxeJ3aXouF3xYK0pTPssXv6GqLOJMzfyeFmhSnVFWFnAeDZCllCkUZBa0yQVBZAfqOSxAASTeSi5v15NZB6ZCxUXoZBqYPh6heSDDmAwUWqD28smFYDdBopWZAU6ih1S3HhgZBRUsWePBG3KRTZAaRQAPcxwMgZDZD"

function loadLib(url) {
  var script = document.createElement("script");
  script.async = false;
  script.src = url;
  document.body.appendChild(script);
}

function buildURL(p0, p1, p2, p3, p4, p5, p6, fbclid, fbpid) {
  if (!p0) {
    return null;
  }
  tracker_token = p0;
  if (p1 || p2) {
    campaign = p1 + "(" + p2 + ")";
  } else {
    campaign = "";
  }
  if (p3 || p4) {
    adgroup = p3 + "(" + p4 + ")";
  } else {
    adgroup = "";
  }
  if (p5 || p6) {
    creative = p5 + "(" + p6 + ")";
  } else {
    creative = "";
  }
  if (!fbclid) {
    fbclid = "";
  }
  if (!fbpid) {
    fbpid = "";
  }
  // build a tracker URL
  let params = {campaign, adgroup, creative, fbclid, fbpid};
  let newURL =
    "https://app.adjust.net.in/" +
    tracker_token +
    "?" +
    Object.keys(params)
      .map((key) => key + "=" + encodeURIComponent(params[key]))
      .join("&");
  return newURL;
}

//get fbpid from Cookie written by Facebook Pixel
function getFbPid() {
  let fbPid = document.cookie.match(/(^|;) ?_fbp=([^;]*)(;|$)/);
  if (fbPid) {
    return fbPid[2];
  } else {
    return null;
  }
}

/**
 * 使用 Image Beacon 在后台发送追踪请求
 * @param {string} trackingUrl - Adjust 的追踪链接
 */
function fireAdjustBeacon(trackingUrl) {
  if (!trackingUrl) return;
  console.log("Firing Adjust Beacon to: " + trackingUrl);
  const beacon = new Image();
  beacon.src = trackingUrl;
}

//跳入ad跟踪链接
function gotoAdjust(downUrl) {
  // get query string, and parse it with URLSearchParams
  const urlParams = new URLSearchParams(window.location.search);
  //p0 = urlParams.get("p0") and fallback to "default"
  p0 = urlParams.get("p0");
  p1 = urlParams.get("p1");
  p2 = urlParams.get("p2");
  p3 = urlParams.get("p3");
  p4 = urlParams.get("p4");
  p5 = urlParams.get("p5");
  p6 = urlParams.get("p6");
  fbPid = getFbPid();
  fbClickId = urlParams.get("fbclid");
  url = buildURL(p0, p1, p2, p3, p4, p5, p6, fbClickId, fbPid);
  if (url == null) {
    window.location.href = downUrl;
  } else {
    url = url + "&redirect=" + encodeURIComponent(downUrl);
    window.location.href = url
  }

}

function appendPixelId(url, fb_pixel_id, fb_access_token) {
  if (url == null) {
    return null;
  }

  let params = {fb_pixel_id, fb_access_token};
  let finalTrackingUrl = url + "&";
  finalTrackingUrl = finalTrackingUrl +
    Object.keys(params)
      .map((key) => key + "=" + encodeURIComponent(params[key]))
      .join("&");
  return finalTrackingUrl;
}


function firePostBeacon(trackingUrl, dataObject) {
  if (!trackingUrl || !dataObject) return;

  // 检查浏览器是否支持 navigator.sendBeacon
  if (navigator.sendBeacon) {
    console.log("Firing POST beacon to: " + trackingUrl);

    // 1. 将 JavaScript 对象转换为 JSON 字符串
    const jsonString = JSON.stringify(dataObject);

    // 2. 将 JSON 字符串包装成一个 Blob 对象
    const blob = new Blob([jsonString], {type: 'application/json'});

    // 3. 发送信标。浏览器会确保这个 POST 请求被发出，即使页面立即跳转。
    navigator.sendBeacon(trackingUrl, blob);

  } else {
    // 如果浏览器不支持 sendBeacon，可以回退到其他方法，
    // 比如同步的 XMLHttpRequest，或者干脆放弃发送。
    console.warn("navigator.sendBeacon is not supported in this browser.");
  }
}


function buildURLForEvent2V1(url) {
  if (url == null) {
    return null;
  }
  return appendPixelId(url, $fb_pixel_id, $fb_access_token);
}

function handlerAdjustEvent(ad_url, downUrl) {
  if (ad_url == null) {
    window.location.href = downUrl;
  } else {
    setTimeout(function () {
      // --- 最后执行最终的跳转 ---
      // 构建包含 redirect 的主追踪链接 使用默认 pixel id 和 access token，无需额外参数
      if (ad_url == null) {
        window.location.href = downUrl;
      } else {
        let evUrl1 = buildURLForEvent2V1(ad_url);
        const redirectUrl = evUrl1 + "&redirect=" + encodeURIComponent(downUrl);
        window.location.href = redirectUrl;
      }
    }, 200);

  }
}

function gotoAdjustV2(downUrl) {
  // get query string, and parse it with URLSearchParams
  const urlParams = new URLSearchParams(window.location.search);
  //p0 = urlParams.get("p0") and fallback to "default"
  p0 = urlParams.get("p0");
  p1 = urlParams.get("p1");
  p2 = urlParams.get("p2");
  p3 = urlParams.get("p3");
  p4 = urlParams.get("p4");
  p5 = urlParams.get("p5");
  p6 = urlParams.get("p6");
  fbPid = getFbPid();
  fbClickId = urlParams.get("fbclid");
  url = buildURL(p0, p1, p2, p3, p4, p5, p6, fbClickId, fbPid);
  handlerAdjustEvent(url, downUrl);
}

//用于从url获取指定参数
function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  var context = "";
  if (r != null)
    context = r[2];
  reg = null;
  r = null;
  return context == null || context == "" || context == "undefined" ? "" : context;
}

function goto() {
  let u = window.navigator.userAgent;
  let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
  let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
  if (isiOS) {
    let downUrl = "##"
    window.location.href = downUrl//这里跳IOS链接，和上面一样
  } else {
    gotoAdjustV2($downUrl);
  }
}

function goto_push_lead_fb_ev() {
  if (typeof fbq === 'function') {
    fbq('track', 'SubmitApplication');
  }
  let u = window.navigator.userAgent;
  let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
  let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
  if (isiOS) {
    let downUrl = "##"
    window.location.href = downUrl//这里跳IOS链接，和上面一样
  } else {
    gotoAdjustV2($downUrl);
  }
}
