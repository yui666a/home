////////////////////////////////////
// 焦点を合わせるとSNSへ移動
////////////////////////////////////
var instagram = document.querySelector('#instagram');
var facebook = document.querySelector('#facebook');
var twitter = document.querySelector('#twitter');
instagram.addEventListener('click', function () {
    location.href = "https://www.instagram.com/yui.ai/";
    console.log("instagram visit \"https://www.instagram.com/yui.ai/\"");
});
facebook.addEventListener('click', function () {
    location.href = "https://www.facebook.com/hitoshi.aiso/";
    console.log("facebook visit \"https://www.facebook.com/hitoshi.aiso/\"");
});
twitter.addEventListener('click', function () {
    location.href = "https://twitter.com/yui_ai666";
    console.log("twitter visit \"https://twitter.com/yui_ai666\"");
});
////////////////////////////////////
// 焦点を合わせると色変化
////////////////////////////////////
// var targetEl = document.querySelector("#target");
// targetEl.addEventListener("click", function () {
//     targetEl.setAttribute("material", {
//         color: "red"
//     });
//     console.log("clicked");
// });

////////////////////////////////////
// タッチ機能の検証
////////////////////////////////////
// AFRAME.registerComponent("cursor-listener", {
//     init: function () {
//         let self = this;
//         this.el.addEventListener("click", function (e) {
//             self.el.setAttribute("color", "#f0f");
//         }, false);
//         this.el.addEventListener("raycaster-intersected", function (e) {
//             self.el.setAttribute("color", "#00f");
//         }, false);
//         this.el.addEventListener("raycaster-intersected-cleared", function (e) {
//             self.el.setAttribute("color", "#fff");
//         }, false);
//     }
// });

////////////////////////////////////
//加速度センサの情報取得の許可
////////////////////////////////////
document
    .getElementById("request_permission")
    .addEventListener("click", function () {
        if (
            DeviceMotionEvent &&
            DeviceMotionEvent.requestPermission &&
            typeof DeviceMotionEvent.requestPermission === "function"
        ) {
            DeviceMotionEvent.requestPermission();
        }
        if (
            DeviceOrientationEvent &&
            DeviceOrientationEvent.requestPermission &&
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
            DeviceOrientationEvent.requestPermission();
        }
    });