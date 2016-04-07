( function() {
	window.App = {
		Models: {},
		Collections: {},
		Views: {},
		Helpers: {},
		pars : [4,5,4,3,4,3,4,5,4,4,4,3,5,4,5,3,4,4],
	};
	
	App.Helpers.template = function(id){
		return _.template( $('#' + id).html() );
	};

	App.Helpers.getRound = function(){
		var d = new Date();
		var n = d.getDate(); 
		var round;
		switch( n ){
			case 9:
				round = 1;
			break;
			case 10:
				round = 2;
			break;
			case 11:
				round = 3;
			break;
			case 12:
				round = 4;
			break;
		}

		return round;
	}
        
	App.Helpers.requestCrossDomain = function( site, callback ) {

	    // If no url was passed, exit.
	    if ( !site ) {
	        alert('No site was passed.');
	        return false;
	    }

	    // Take the provided url, and add it to a YQL query. Make sure you 

	    //var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + site + '"') + '&format=json&callback=?';

	    // Request that YSQL string, and run a callback function.
	    // Pass a defined function to prevent cache-busting.
	    $.getJSON( site, cbFunc );

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
		},
		getScores: function(front){
			var scores;
			switch( App.Helpers.getRound() ){
				case 1:
					scores = this.get('r1_scores')[2];
				break;
				case 2:
					scores = this.get('r2_scores')[2];
				break;
				case 3:
					scores = this.get('r3_scores')[2];
				break;
				case 4:
					scores = this.get('r4_scores')[2];
				break;
			}

			if( front === true ){
				return scores.slice(0,9).split('');
			} else {
				return scores.slice(9,18).split('');
			}
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
        'click .star': 'toggleOurs',
        'click .view-player': 'viewPlayer'
    },
    viewPlayer: function(e){
    	var $modal = $('#player-modal');

    	$modal.find('#player-name').text( this.model.get('name'));

    	var frontNine = this.model.getScores(true);
    	var backNine = this.model.getScores(false);

    	console.log(frontNine);

    	var frontNineView = new App.Views.Scores({scores: frontNine, top: true });
    	var backNineView = new App.Views.Scores({scores: backNine, top:false });


    	$modal.find('tr.scores').remove();
    	$modal.find('#front-nine').append(frontNineView.$el);
    	$modal.find('#back-nine').append(backNineView.$el);
    	$modal.find('#scores-round-info').text('Round '+App.Helpers.getRound() );
    	$modal.modal();
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

	App.Views.Scores = Backbone.View.extend({
		tagName: 'tr',
		className: 'scores',
		top: true,
		initialize: function(options){
			this.top = options.top;
			this.scores = options.scores;
			this.render();
		},
		render: function(){

			var self = this;
			self.$el.append($('<td/>'));

			var hole = (this.top) ? 0 : 9;


			_.each( this.scores, function(score){
				var par = App.pars[hole];
				var score_letter = score;
				var the_score;

				switch( score_letter.toLowerCase() ){
					case "a": the_score = 1; break;
					case "b": the_score = 2; break;
					case "c": the_score = 3; break;
					case "d": the_score = 4; break;
					case "e": the_score = 5; break;
					case "f": the_score = 6; break;
					case "g": the_score = 7; break;
					case "h": the_score = 8; break;
					case "i": the_score = 9; break;
					case "j": the_score = 10; break;
					default: the_score = '-'; break;
				}

				var $td = $('<td/>');
				var $div = $('<div/>');
				$div.text( the_score );
				if( the_score < par ){
					$div.addClass('under');
				} else if( the_score > par ){
					$div.addClass('over');
				}

				$td.append($div);
				
				self.$el.append($td);

				hole++;
			});

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
			
			
			$('#refresh').removeClass('btn-danger').addClass('btn-info').find('.icon').removeClass('icon-time').addClass('icon-refresh');
			var time = new Date();
                        var hours = time.getHours();
                        if( hours < 10 ){
                            hours = "0" + hours;
                        }
                        var minutes = time.getMinutes();
                        if( minutes < 10 ){
                            minutes = "0" + minutes;
                        }
			$('#info').html('<span class="hidden-phone">(updated '+hours+":"+minutes+")</span>");
			
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

      $.each( players, function(i, player){

              var id = "id-" + player.id;
              var name = player.display_name +', '+player.first_name;
              var our_player_index = App.Helpers.getSavedPlayers().indexOf( id );
              var ours = (our_player_index>=0);
              
              var r1_scores = player.r1.split('|');
              var r2_scores = player.r2.split('|');
              var r3_scores = player.r3.split('|');
              var r4_scores = player.r4.split('|');


              players_data.push( {
                id: id,
                place: player.pos,
                name: name,
                country: player.country,
                score: player.topar,
                today: player.today,
                through: (player.active == "1" || player.thru == "F") ? player.thru : player.teetime,
                round1: r1_scores[1],
                round2: r2_scores[1],
                round3: r3_scores[1],
                round4: r4_scores[1],
                ours: ours,
                r1_scores: r1_scores,
                r2_scores: r2_scores,
                r3_scores: r3_scores,
                r4_scores: r4_scores
              });
      });

      var playersCollection = new App.Collections.Players( players_data );
      App.Collections.obscuraCollection = new Backbone.Obscura(playersCollection);

      if( $('#filter').hasClass('active')){
				App.Collections.obscuraCollection.filterBy('saved players', { ours:true });
      }
      App.Views.playersView = new App.Views.Players({ collection: App.Collections.obscuraCollection });
  }
        
	App.Helpers.getScores = function(){
    $('#info').html('')
		$('#refresh').removeClass('btn-info').addClass('btn-danger').find('.icon').removeClass('icon-refresh').addClass('icon-time');
                
    App.Helpers.requestCrossDomain( 'http://ht2.mycuratr.com/scores.php', function(data){
    	console.log(data);
      App.Helpers.drawPlayers(data.data.player);
    });
	}
        
	
 	$('#playersTableBody').html( App.Helpers.template('loadingTR') );
	
	$('#refresh').click( function(){
		App.Helpers.getScores();
		App.Helpers.createTimer();
	});

	$('#filter').click( function(){
		var $el = $(this);
		if( $el.hasClass('active') ){
			App.Collections.obscuraCollection.removeFilter('saved players');
		} else {
			App.Collections.obscuraCollection.filterBy('saved players', { ours:true });
		}

		App.Views.playersView.render();

		$el.toggleClass('active');
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

