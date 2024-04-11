const express = require("express");
const app = express();
const axios = require("axios");
const bodyParser = require("body-parser");
const Botly = require("botly");
const PageID = "100091128288656";
const quote = require('./quotes');
require('dotenv').config()
const botly = new Botly({
  accessToken: process.env.PAGE_ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
});
/* ----- DB ----- */
const { Deta } = require('deta');
const deta = Deta();
const db = deta.Base('users');
/* ----- DB ----- */
app.get("/", function (_req, res) {
  res.sendStatus(200);
});
app.use(
  bodyParser.json({
    verify: botly.getVerifySignature(process.env.APP_SECRET),
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/webhook", botly.router());
botly.on("message", async (senderId, message) => {
  //console.log(message)
  /*--------- s t a r t ---------*/
  const user = await db.get(senderId);
  if (message.message.text) {
    if (user != null) {
      axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${user.lang}&dt=t&q=${message.message.text}`)
      .then (({ data }) => {
        let text = "";
        data[0].forEach(element => {
          text += '\n' + element[0];
        });
        botly.sendText({id: senderId, text: text,
          quick_replies: [
              botly.createQuickReply("تغيير اللغة 🇺🇲🔄", "ChangeLang")]});
      }, error => {
        console.log(error)
      })
      } else {
        await db.put({ lang: "en" }, senderId)
        .then((data) => {
          axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${message.message.text}`)
          .then (({ data }) => {
            let text = "";
            data[0].forEach(element => {
            text += '\n' + element[0];
          });
          botly.sendText({id: senderId, text: text,
            quick_replies: [
              botly.createQuickReply("تغيير اللغة 🇺🇲🔄", "ChangeLang")]});
            }, error => { console.log(error) })
            });
      }
    } else if (message.message.attachments[0].payload.sticker_id) {
      botly.sendText({id: senderId, text: "(Y)"});
    } else if (message.message.attachments[0].type == "image") {
      botly.sendText({id: senderId, text: "لايمكننا ترجمة الصور 📷 بعد! إستعمل النصوص فقط 🤠"});
    } else if (message.message.attachments[0].type == "audio") {
      botly.sendText({id: senderId, text: "لا يمكنني ترجمة الصوت للأسف! إستعمل النصوص فقط 😐"});
    } else if (message.message.attachments[0].type == "video") {
      botly.sendText({id: senderId, text: "أنا غير قادر على ترجمة الفيديوهات 🎥! إستعمل النصوص فقط 🤠"});
    botly.sendText({id: senderId, text: "Hi There!"}, function (err, data) {
      console.log(data);
});
    }

  /*--------- e n d ---------*/
});
botly.on("postback", async (senderId, message, postback, data, ref) => {
    /*--------- s t a r t ---------*/
    const user = await db.get(senderId);
    if (message.postback){ // Normal (buttons)
      if (postback == "GET_STARTED"){
          if (user != null) {
            botly.sendText({id: senderId, text: "أهلا بك مجددا في ترجمان 😁☺️"});
          } else {
            await db.put({ lang: "en" }, senderId)
            .then((data) => {
              botly.sendGeneric({id: senderId, elements: {
                title: "يا أهلا بك في ترجمان! 😀",
                image_url: "https://i.ibb.co/NstpC5B/trjmn.png",
                subtitle: "انا روبوت ترجمة 🤖, أستطيع الترجمة إلى 13 لغة مختلفة 🌍😁",
                buttons: [
                    botly.createPostbackButton("تغيير اللغة 🇺🇲🔄", "ChangeLang")
                ]}, aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});
            });
          }
      } else if (postback == "ChangeLang") {
          botly.send({
              "id": senderId,
              "message": {
              "text": "من فضلك إختر اللغة التي تريد ان اترجم لك لها 🔁🌐",
              "quick_replies":[
                {
                  "content_type":"text",
                  "title":"Arabic 🇩🇿",
                  "payload":"ar",
                },{
                  "content_type":"text",
                  "title":"English 🇺🇸",
                  "payload":"en",
                },{
                  "content_type":"text",
                  "title":"French 🇫🇷",
                  "payload":"fr",
                },{
                  "content_type":"text",
                  "title":"German 🇩🇪",
                  "payload":"de",
                },{
                  "content_type":"text",
                  "title":"Spanish 🇪🇸",
                  "payload":"es",
                },{
                  "content_type":"text",
                  "title":"Russian 🇷🇺",
                  "payload":"ru",
                },{
                  "content_type":"text",
                  "title":"Italian 🇮🇹",
                  "payload":"it",
                },{
                  "content_type":"text",
                  "title":"Turkish 🇹🇷",
                  "payload":"tr",
                },{
                  "content_type":"text",
                  "title":"Korean 🇰🇷",
                  "payload":"ko",
                },{
                  "content_type":"text",
                  "title":"Japanese 🇯🇵",
                  "payload":"ja",
                },{
                  "content_type":"text",
                  "title":"Hindi 🇮🇳",
                  "payload":"hi",
                },{
                  "content_type":"text",
                  "title":"Albanian 🇦🇱",
                  "payload":"sq",
                },{
                  "content_type":"text",
                  "title":"Swedish 🇸🇪",
                  "payload":"sv",
                }
              ]
            }
            });
      } else if (postback == "tbs") {
          //
      } else if (postback == "OurBots") {
        botly.sendText({id: senderId, text: `مرحبا 👋\nيمكنك تجربة كل الصفحات التي أقدمها لكم 👇 إضغط على إسم أي صفحة للتعرف عليها و مراسلتها 💬 كل الصفحات تعود لصانع واحد و كل ماتراه أمامك يُصنع بكل حـ💜ـب و إهتمام في ليالي الارض الجزائرية.\n• ${quote.quotes()} •`,
        quick_replies: [
           botly.createQuickReply("كالربوت 📞", "callerbot"),
           botly.createQuickReply("شيربوت 🌙", "sharebot"),
           botly.createQuickReply("بوتباد 📖", "bottpad"),
           botly.createQuickReply("ترجمان 🌍", "torjman"),
           botly.createQuickReply("بوتيوب ↗️", "botube"),
           botly.createQuickReply("كيوبوت 🐱", "qbot"),
           botly.createQuickReply("سمسمي 🌞", "simsimi")]});
      }
    } else { // Quick Reply
      if (message.message.text == "tbs") {
          //
      } else if (message.message.text == "tbs") {
        //
      } else if (postback == "ChangeLang"){
          botly.send({
              "id": senderId,
              "message": {
              "text": "من فضلك إختر اللغة التي تريد ان اترجم لك لها 🔁🌐",
              "quick_replies":[
                {
                  "content_type":"text",
                  "title":"Arabic 🇩🇿",
                  "payload":"ar",
                },{
                  "content_type":"text",
                  "title":"English 🇺🇸",
                  "payload":"en",
                },{
                  "content_type":"text",
                  "title":"French 🇫🇷",
                  "payload":"fr",
                },{
                  "content_type":"text",
                  "title":"German 🇩🇪",
                  "payload":"de",
                },{
                  "content_type":"text",
                  "title":"Spanish 🇪🇸",
                  "payload":"es",
                },{
                  "content_type":"text",
                  "title":"Russian 🇷🇺",
                  "payload":"ru",
                },{
                  "content_type":"text",
                  "title":"Italian 🇮🇹",
                  "payload":"it",
                },{
                  "content_type":"text",
                  "title":"Turkish 🇹🇷",
                  "payload":"tr",
                },{
                  "content_type":"text",
                  "title":"Korean 🇰🇷",
                  "payload":"ko",
                },{
                  "content_type":"text",
                  "title":"Japanese 🇯🇵",
                  "payload":"ja",
                },{
                  "content_type":"text",
                  "title":"Hindi 🇮🇳",
                  "payload":"hi",
                },{
                  "content_type":"text",
                  "title":"Albanian 🇦🇱",
                  "payload":"sq",
                },{
                  "content_type":"text",
                  "title":"Swedish 🇸🇪",
                  "payload":"sv",
                }
              ]
            }
            });
      } else if (postback == "callerbot") {
        botly.sendGeneric({id: senderId, elements: {
           title: "CallerBot - كالربوت",
           image_url: "https://i.ibb.co/gM5pKr4/gencallerbot.png",
           subtitle: "صفحة ترسل لها اي رقم هاتف و ستبحث لك عن صاحب هذا الرقم",
           buttons: [
              botly.createWebURLButton("على الماسنجر 💬", "m.me/CallerBot/"),
              botly.createWebURLButton("على الفيسبوك 🌐", "facebook.com/CallerBot/"),
              botly.createWebURLButton("حساب الصانع 🇩🇿", "facebook.com/0xNoti/")]},
            aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});
       } else if (postback == "sharebot"){
        botly.sendGeneric({id: senderId, elements: {
           title: "ShareBot - شيربوت",
           image_url: "https://i.ibb.co/2nSB6xx/gensharebot.png",
           subtitle: "صفحة لتحميل الفيديوهات من التيك توك بدون علامة او الريلز و فيديوهات الفيسبوك",
           buttons: [
              botly.createWebURLButton("على الماسنجر 💬", "m.me/ShareBotApp/"),
              botly.createWebURLButton("على الفيسبوك 🌐", "facebook.com/ShareBotApp/"),
              botly.createWebURLButton("حساب الصانع 🇩🇿", "facebook.com/0xNoti/")]},
            aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});
       } else if (postback == "bottpad"){
        botly.sendGeneric({id: senderId, elements: {
           title: "Bottpad - بوتباد",
           image_url: "https://i.ibb.co/RBQZbXG/genbottpad.png",
           subtitle: "صفحة تجلب لك روايات من واتباد و ترسلها لك لكي تقرأها على الفيسبوك",
           buttons: [
              botly.createWebURLButton("على الماسنجر 💬", "m.me/Bottpad/"),
              botly.createWebURLButton("على الفيسبوك 🌐", "facebook.com/Bottpad/"),
              botly.createWebURLButton("حساب الصانع 🇩🇿", "facebook.com/0xNoti/")]},
            aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});
       } else if (postback == "torjman") {
        botly.sendGeneric({id: senderId, elements: {
           title: "Torjman - Translation Bot",
           image_url: "https://i.ibb.co/hCtJM06/gentorjman.png",
           subtitle: "صفحة ترجمة تدعم 13 لغة مختلفة تساعدك على ترجمة النصوص بشكل فوري",
           buttons: [
              botly.createWebURLButton("على الماسنجر 💬", "m.me/TorjmanBot/"),
              botly.createWebURLButton("على الفيسبوك 🌐", "facebook.com/TorjmanBot/"),
              botly.createWebURLButton("حساب الصانع 🇩🇿", "facebook.com/0xNoti/")]},
            aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});
       } else if (postback == "botube") {
        botly.sendGeneric({id: senderId, elements: {
           title: "Botube - بوتيوب",
           image_url: "https://i.ibb.co/jvt0t0B/genbotube.png",
           subtitle: "صفحة تبحث بها على اليوتيوب و ترسل لك فيديوهات يمكنك مشاهدتها و الاستماع لها",
           buttons: [
              botly.createWebURLButton("على الماسنجر 💬", "m.me/BotubeApp/"),
              botly.createWebURLButton("على الفيسبوك 🌐", "facebook.com/BotubeApp/"),
              botly.createWebURLButton("حساب الصانع 🇩🇿", "facebook.com/0xNoti/")]},
            aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL}); 
       } else if (postback == "qbot") {
        botly.sendGeneric({id: senderId, elements: {
           title: "كيوبوت - QBot",
           image_url: "https://i.ibb.co/Fx7kGFj/genqbot.png",
           subtitle: "صفحة يمكنك التحدث لها مثل الانسان بكل حرية و مناقشة معاها المواضيع التي تريدها",
           buttons: [
              botly.createWebURLButton("على الماسنجر 💬", "m.me/QBotAI/"),
              botly.createWebURLButton("على الفيسبوك 🌐", "facebook.com/QBotAI/"),
              botly.createWebURLButton("حساب الصانع 🇩🇿", "facebook.com/0xNoti/")]},
            aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});
       } else if (postback == "simsimi") {
        botly.sendGeneric({id: senderId, elements: {
           title: "سمسمي الجزائري - Simsimi Algerian",
           image_url: "https://i.ibb.co/DkdLSSG/gensimsimi.png",
           subtitle: "صفحة للمرح فقط تقوم بالرد على رسائلك بشكل طريف تتحدث باللهجة الجزائرية فقط",
           buttons: [
              botly.createWebURLButton("على الماسنجر 💬", "m.me/SimsimiAlgerian/"),
              botly.createWebURLButton("على الفيسبوك 🌐", "facebook.com/SimsimiAlgerian/"),
              botly.createWebURLButton("حساب الصانع 🇩🇿", "facebook.com/0xNoti/")]},
            aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});
       } else {
        await db.update({ lang: postback }, senderId)
            .then((data) => {
              botly.sendText({id: senderId, text: "تم تغيير اللغة بنجاح 😀🌍"});
            });
       }
    }
   /*--------- e n d ---------*/
});
/*------------- RESP -------------*/
/*
botly.setGetStarted({pageId: PageID, payload: "GET_STARTED"});
botly.setGreetingText({
    pageId: PageID,
    greeting: [
      {
        locale: "default",
        text: "Welcome to Torjman 🔥, 𝓦𝓮 𝓬𝓾𝓼𝓽𝓸𝓶𝓲𝔃𝓮 𝓸𝓾𝓻 𝓸𝔀𝓷 𝓻𝓮𝓪𝓵𝓲𝓽𝔂 𝓱𝓮𝓻𝓮! 🌙↗️"
      },
      {
        locale: "ar_AR",
        text: "مرحبا بك في ترجمان 🔥. هنا تصنع أحلامنا و تتجسد للواقع 🌙↖️"
      }
    ]
  });
botly.setPersistentMenu({
    pageId: PageID,
    menu: [
        {
          locale: "default",
          composer_input_disabled: false,
          call_to_actions: [
            {
              title:   "تعرف على بوتات أخرى 🤖",
              type:    "postback",
              payload: "OurBots"
            },{
              title:   "تغيير اللغة 🌐🔃",
              type:    "postback",
              payload: "ChangeLang"
            },{
              type:  "web_url",
              title: "صنع بكل حـ❤️ـب في الجز🌙ائر",
              url:   "m.me/100009587281617/",
              webview_height_ratio: "full"
            }
          ]
        }
      ]
  });

/*------------- RESP -------------*/
app.listen(3000, () =>
  console.log(`App is on Port : 3000`)
)