// ==UserScript==
// @name        Twitch Chat Filter
// @description
// @namespace
// @include	    https://www.twitch.tv/*
// @version     1.14
// @grant       none
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// ==/UserScript==

const blockEmotesOnly = false;
const lengthLimit = 200;
const blockOneWord = false;
const allowEmotesNumber = 3;
const spamCoeff=14;
const minlength=4;

function CanShow(message, emotes, sender, myUsername) {
    if(blockEmotesOnly && message.length<=0){
      console.log("Filter emotes only: "+message);
      return false;
    }

    if(lengthLimit>0 && message.length>lengthLimit){
      console.log("Filter by length["+lengthLimit+"]: "+message);
      return false;
    }

    if(blockOneWord && message.split(" ").length>1){
      console.log("Filter one-word: "+message);
      return false;
    }

    if(allowEmotesNumber>0 && emotes.length>allowEmotesNumber){
      console.log("Filter emote# ["+allowEmotesNumber+"]: "+emotes.length);
      return false;
    }

    var mrep = message.replace(/[\.,\?!0-9]+/g, '').trim();
    if(minlength>0 && mrep.length<minlength){
      if(mrep.length>0){
        console.log("Filter nonword: "+message);
      }
      return false;
    }

    if(spamCoeff>0){
        var parts = mrep.split(" ");
        var wordMap = new Map();
        parts.forEach(function(element) {
            var count = wordMap.get(element);
            if(count==null){
                wordMap.set(element, 1);
            } else {
                wordMap.set(element, count+1);
            }
        });
        var coeff = message.length/wordMap.size;
        if (coeff>spamCoeff){
            console.log("Filter coeff ["+coeff+"]: "+message);
            return false;
        }
    }

    return message.toLowerCase().indexOf(myUsername) > -1;
}

$(document).ready(function() {
    $("head").append("<style type='text/css'>.chat-line__message { display: none; }</style>");

    var myUsername = $("#you .username").text().toLowerCase();

    setInterval(function() {
        var messages = $(".chat-line__message").not(".chat-line__blacklist");
        var whitelist = $(".chat-line__whitelist").toArray();

        messages.each(function() {
            if (whitelist.includes(this)){
              $(this).show();
              return;
            }

            var message = $("span[data-a-target='chat-message-text']", this);
            var sender = $(".chat-author__display-name", this).text().toLowerCase();
            var emotes = $("div.chat-line__message--emote-button", this);

            if (CanShow(message.text(), emotes, sender, myUsername)) {
                $(this).show();
                $(this).addClass("chat-line__whitelist");
            } else{
                $(this).addClass("chat-line__blacklist");
            }
        });
    }, 200);
});
