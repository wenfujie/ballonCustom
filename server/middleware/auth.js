const authCertify = async function (ctx, next) {
  var url = ctx.request.url;
  // var token = ctx.request.headers.token;
  // if (token || url === "/login") {
  //   await next();
  // } else {
  //   ctx.body = {
  //     message: "请重新登陆"
  //   }
  // }
}

module.exports = authCertify
