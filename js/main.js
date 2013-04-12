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

            var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + site + '"') + '&format=json&callback=?';

            // Request that YSQL string, and run a callback function.
            // Pass a defined function to prevent cache-busting.
            $.getJSON( yql, cbFunc );

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
	
	
        App.Helpers.drawPlayers = function(players){
            var players_data = [];

            $.each( players, function(i, player_data){
                if( i != 0 ) {
                    var player_split = player_data.split('|');
                    var id = player_split[2];
                    var name = player_split[34];
                    var our_player_index = App.Helpers.getSavedPlayers().indexOf( id );
                    var ours = (our_player_index>=0);
                    
                    players_data.push( {
                            id: id,
                            place: player_split[1],
                            name: name,
                            country: player_split[33],
                            score: player_split[4],
                            through: player_split[5],
                            round1: player_split[7],
                            round2: player_split[8],
                            round3: player_split[9],
                            round4: player_split[10],
                            ours: ours
                    });
                }
            });

            var playersCollection = new App.Collections.Players( players_data );
            var playersView = new App.Views.Players({ collection: playersCollection });
        }
        
	App.Helpers.getScores = function(){
                $('#info').html('Refreshing...')
		$('#refresh').removeClass('btn-danger').addClass('btn-info');
                
                App.Helpers.requestCrossDomain( 'http://www.masters.com/en_US/xml/gen/scores/scores.flash.xml', function(data){
                    
                    App.Helpers.drawPlayers(data.query.results.body.p);
                });
	}
        
	
        $('#playersTableBody').html( App.Helpers.template('loadingTR') );
	
	$('#refresh').click( function(){
		App.Helpers.getScores();
		App.Helpers.createTimer();
	})
	
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

