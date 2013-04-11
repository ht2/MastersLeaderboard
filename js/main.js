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
	
	App.Models.Player = Backbone.Model.extend({
		defaults: {
			name: "John Doe",
			place: "0",
			score: "0",
			through: "0",
			ours: false
		}
	});
	App.Collections.Players = Backbone.Collection.extend({
		model: App.Models.Player
	});
	
	App.Views.PlayerItem = Backbone.View.extend({
		template: App.Helpers.template('playerTemplate'),
		tagName: 'tr',
		render: function(){
			this.$el.html( this.template( this.model.toJSON() ) );
			return this;
		}
	});
	
	App.Views.Players = Backbone.View.extend({
		initialize: function(){			
			this.element = $('#playersTableBody');
			this.setElement( this.element );
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
			$('#info').html('Refresh (last updated '+time.getUTCHours()+":"+time.getUTCMinutes()+")");
			return this;
		}
	});
	
	
	App.ourPlayers = [
		'Justin Rose',
		'Tiger Woods',
		'Thorbjorn Olesen',
		'Lee Westwood',
		'Martin Kaymer',
		'Freddie Jacobson',
		'Brandt Snedeker'
	];
	
	App.Helpers.getScores = function(){
		$('#info').html('Loading');
		$('#refresh').removeClass('btn-danger').addClass('btn-info');
		$.get('scores.php').success( function(xml){
			var data = $.xml2json(xml);
			var players = data.p;
			
			var players_data = [];

			$.each( players, function(i, player_data){
				var player_split = player_data.split('|');
				
				var name = player_split[34];
				var our_player_index = App.ourPlayers.indexOf( name );
				var ours = (our_player_index>=0);
				
				players_data.push( {
					place: player_split[1],
					name: player_split[34],
					score: player_split[4],
					through: player_split[5],
					ours: ours
				});
			});

			var playersCollection = new App.Collections.Players( players_data );
			var playersView = new App.Views.Players({ collection: playersCollection });

		});
	}
	
	
	$('#refresh').click( function(){
		App.Helpers.getScores();
		App.Helpers.creatTimer();
	})
	
	App.Helpers.creatTimer = function(){
		if( typeof App.timer != "undefined" ){
			clearInterval(App.timer);
			App.timer = null;
		}
		
		App.timer = setInterval( function(){ 
			App.Helpers.getScores(); 
		}, 30000 );
	};
	
	App.Helpers.creatTimer();
	App.Helpers.getScores();
	
	

})();

