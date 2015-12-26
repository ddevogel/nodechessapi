var request = require('request');
var cheerio = require('cheerio');
var Game = require('./game.js');

var url = 'http://www.chessgames.com/perl/chess.pl'

module.exports = {
  games: function(params, callback){
    var me = this;
    var result = [];
    var page = 1;
    (function getPage(){
      request({
        url: url,
        qs: {
          yearcomp: 'exactly',
          playercomp: 'either',
          year: params.year ? params.year : "",
          player: params.player ? params.player : "",
          player2: params.player2 ? params.player2 : "",
          eco: params.eco ? params.eco : "",
          result: params.result ? params.result : "",
          page: page.toString()
        },
        method: 'GET'
      }, function(error, response, body){
          if(error) {
              console.log(error);
          } else {
              $ = cheerio.load(body);
              result = result.concat(me.getGames($));
              if(me.hasNextPage($)){
                page += 1;
                getPage();
              } else {
                callback(result);
              }
          }
        }
      );
    })();
  },
  hasNextPage: function($){
    return  $("img[src='/chessimages/next.gif']").length > 0;
  },
  getGames: function($){
    var result = [];

    $("tr[bgcolor='#FFFFFF'], tr[bgcolor='#EEDDCC']").each(function(index, item){
          var game = new Game();
          var f = $($(item).find("td font"));
          $(f).each(function(findex, fitem){
            var l = $($(fitem).find("a"));
            $(l).each(function(lindex, litem){
              var h = litem.attribs['href'].split('=');
              switch(h[0].split('?')[1]){
                case 'gid':
                  game.id = h[1];
                  var players = litem.children[0].data.split(' vs ');
                  game.white = players[0];
                  game.black = players[1];
                  break;
                case 'tid':
                  game.location = litem.children[0].data;
                  break;
                case 'eco':
                  game.eco = h[1];
                  break;
                default:
                  break;
              }
            });
            switch(findex){
              case 1:
                game.result = fitem.children[0].data;
                break;
              case 2:
                game.moves = fitem.children[0].data;
                break;
              case 3:
                game.year = fitem.children[0].data;
                break;
              case 4:
                if(!game.location){
                  //The location (from the previous switch) is not a hyperlink
                  game.location = $(fitem).find('font')[0].children[0].data;
                }
                break;
              default:
                break;
            }
          })
          result.push(game);
        })
        return result;
  }
};
// http://www.chessgames.com/perl/chess.pl
// ?yearcomp=exactly
// &year=1999
// &playercomp=either
// &player=adams
// &player2=short
// &eco=B89
// &result=1-0
