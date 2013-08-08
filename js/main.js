( function() {
	window.App = {
		Models: {},
		Collections: {},
		Views: {},
		Helpers: {}
	};
	
	App.Helpers.template = function(id){
		return _.template( $('#' + id).html() );
	};
        
        App.Helpers.requestCrossDomain = function( site, callback ) {

            // If no url was passed, exit.
            if ( !site ) {
                alert('No site was passed.');
                return false;
            }

            // Take the provided url, and add it to a YQL query. Make sure you 

            //var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + site + '"') + '&format=json&callback=?';
            //console.log(yql);
            // Request that YSQL string, and run a callback function.
            // Pass a defined function to prevent cache-busting.
            // 
            // 
            $.getJSON( site, cbFunc ).error( function(e){
            	console.log("error");
            	console.log(e);
            });

            function cbFunc(data) {
                callback(data);
            }
        }
        
        App.Helpers.getSavedPlayers = function(){
            var str = $.cookie('savedPlayers');
            
            if( typeof str != 'undefined' ){
                return str.split(',');
            } else {
                return [];
            }
        }
        
       App.Helpers.addSavedPlayer = function( id ){
            var players = App.Helpers.getSavedPlayers();
            
            if( players.indexOf(id) < 0){
                players.push(id);
                $.cookie('savedPlayers', players.join(',') );
            }
       }
        
       App.Helpers.removeSavedPlayer = function( id ){
            var players = App.Helpers.getSavedPlayers();
            var index = players.indexOf(id);
            if( index >= 0){
                players.splice(index, 1);
                $.cookie('savedPlayers', players.join(',') );
            }
       }
        
	
	App.Models.Player = Backbone.Model.extend({
		defaults: {
            id: 0,
			name: "John Doe",
            country: 'UK',
			place: "0",
			score: "0",
			today: "0",
			through: "0",
			round1:"",
            round2:"",
            round3:"",
            round4:"",
			ours: false
		}
	});
	App.Collections.Players = Backbone.Collection.extend({
		model: App.Models.Player
	});
	
	App.Views.PlayerItem = Backbone.View.extend({
		template: App.Helpers.template('playerTemplate'),
		tagName: 'tr',
                initialize: function(){
                    this.model.on('change', this.render, this);
                },
                events:{
                    'click .star': 'toggleOurs'
                },
                toggleOurs: function(){
                    this.model.set('ours', !this.model.get('ours'));
                    if( this.model.get('ours') ){
                        App.Helpers.addSavedPlayer( this.model.get('id') );
                    } else {
                        App.Helpers.removeSavedPlayer( this.model.get('id') );
                    }
                },
		render: function(){
			this.$el.html( this.template( this.model.toJSON() ) );
			return this;
		}
	});
	
	App.Views.Players = Backbone.View.extend({
		initialize: function(){			
			this.element = $('#playersTableBody');
			this.setElement( this.element );
                        this.collection.on('change', this.render, this );
			this.render();
		},
		tagName: '<tr>',
		render: function(){
			this.$el.html('');
			this.collection.each(function(player){
				var playerView = new App.Views.PlayerItem({model: player});
				var view = playerView.render().el;
				
				if( player.get('ours') ){
                                    $(view).addClass('ours');
				}
				this.$el.append( view );
				
			}, this);
			
			
			$('#refresh').removeClass('btn-info').addClass('btn-danger');
			var time = new Date();
                        var hours = time.getHours();
                        var minutes = time.getMinutes();
                        if( minutes < 10 ){
                            minutes = "0" + minutes;
                        }
			$('#info').html('Refresh (last updated '+hours+":"+minutes+")");
			
			var localTime = time.getTime();
			var localOffset = time.getTimezoneOffset() * 60000;
			var utc = localTime + localOffset;
			var offset = -4;
			var augusta = utc + (3600000*offset);
			var augustaTime = new Date(augusta);
			
			var augustaHours = augustaTime.getHours();
			var augustaMinutes = augustaTime.getMinutes();
			if( augustaMinutes < 10 ){
				augustaMinutes = "0" + augustaMinutes;
			}
			$('#augustaTime').html( augustaHours+":"+augustaMinutes );
			
			return this;
		}
	});
	
	
  App.Helpers.drawPlayers = function(players_raw){

  	  //var data = $.parseJSON(players_raw);

      console.log(players_raw);
      var data = players_raw.lb;
  		var players = data.p;


      var players_data = [];

      $.each( players, function(i, player_data){

          //var player_split = player_data.split('|');
          var id = player_data.id;
          //var name = player_split[34];
          var our_player_index = App.Helpers.getSavedPlayers().indexOf( id );
          var ours = (our_player_index>=0);

          var r1_data = player_data.rnd[0];
          var r2_data = player_data.rnd[1];
          var r3_data = player_data.rnd[2];
          var r4_data = player_data.rnd[3];

          var r1, r2, r3, r4;

          r1 = r1_data.str;
          r2 = r2_data.str;
          r3 = r3_data.str;
          r4 = r4_data.str;


          
          players_data.push({
                  id: pid,
                  place: player_data.cp,
                  name: player_data.fn + ' ' + player_data.ln,
                  country: player_data.cnt,
                  score: player_data.cpr,
                  today: player_data.tpr,
                  through: player_data.th,
                  round1: r1,
                  round2: r2,
                  round3: r3,
                  round4: r4,
                  ours: ours
          });
      });

      var playersCollection = new App.Collections.Players( players_data );
      var playersView = new App.Views.Players({ collection: playersCollection });
  }
        
	App.Helpers.getScores = function(){
  	$('#info').html('Refreshing...')
		$('#refresh').removeClass('btn-danger').addClass('btn-info');
    

    App.Helpers.requestCrossDomain( 'http://data.pga.com/jsonp/event/pgachampionship/2013/leaderboard/json/leaderboard.json?callback=?', function(data){
        App.Helpers.drawPlayers(data);
    });
	}
        
	
  $('#playersTableBody').html( App.Helpers.template('loadingTR') );
	
	$('#refresh').click( function(){
		App.Helpers.getScores();
		App.Helpers.createTimer();
	});
	
	App.Helpers.createTimer = function(){
		if( typeof App.timer != "undefined" ){
			clearInterval(App.timer);
			App.timer = null;
		}
		
		App.timer = setInterval( function(){ 
			App.Helpers.getScores(); 
		}, 30000 );
	};
	
	App.Helpers.createTimer();
	App.Helpers.getScores();
	
	

})();

