/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

	player: null,
	karaoke: null,
	renderer: null,
	show: null,
		
    // Application Constructor
    initialize: function() {
		console.log("initialize");
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function() {
		console.log("bindEvents");
       
	    app.onDeviceReady();
	    //document.addEventListener('deviceready', this.onDeviceReady, false);
		//document.addEventListener("touchmove", function (e) { e.preventDefault(); return false; }, false);
    },
    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `app.receivedEvent(...);`
    onDeviceReady: function() {
		console.log("onDeviceReady");
		
		
		// 錄音按錄
		$("#record_btn").click( function() {

			app.show.reset();
		});
		
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
      
        console.log('Received Event: ' + id);

		$.get('ksc.txt', function(data) {

			// 解析字幕
			app.parseData( data );
			
			// 播放音樂
			app.player = $("#audio_id");
			app.player[0].play();
		});

    },
	// 解析字幕 
	parseData: function( data ) {

		// 去除多餘文字
		data = data.replace(/karaoke.add\(/g, "");
		data = data.replace( /\)/g, '' );
		data = data.replace( /\'/g, '' );
		data = data.replace( /\[/g, '' );
		data = data.replace( /\]/g, '' );

		var parseArray = new Array();

		var temp = data.split(";");
		for( var i=0; i<temp.length; i++ ){

			var temp2 = temp[i].split(", ");
			parseArray.push( temp2 );
		}
	
		app.initSubtitle( parseArray );
	},
	initSubtitle: function( parseArray ) {

		var diff_time = 1.0;

		var timingsArray = new Array();
		
		for( var i=0; i<parseArray.length; i++ ) {

			var text_array = new Array();

			var begin_time = -1;
			if( parseArray[i][0] ) {

				var temp = parseArray[i][0].split(":");
				begin_time = (  Math.floor( temp[0] ) * 60 ) + Math.round ( temp[1] *100) / 100;
			}

			var end_time = -1;
			if( parseArray[i][1] ) {

				var temp2 = parseArray[i][1].split(":");
				end_time = ( Math.floor( temp2[0] ) * 60 ) + Math.round ( temp2[1] *100) / 100;
			}

			if( parseArray[i][2] ) {

				var time = 0;
				var song_text = parseArray[i][2].replace( / /g, '' );
				var temp = parseArray[i][3].split(",");
				for( var j=0; j<temp.length; j++ ) {

					var duration = Math.floor( temp[j] ) / 1000;
					duration = Math.round ( duration *100) / 100;

					var text = song_text[ j ] ;
					text_array.push( new Array( time, text ) );

					time += duration;
				}
			}
			
			if( begin_time >= 0 &&  end_time >=0 && text_array.length > 0 ) {

				timingsArray.push( new Array( begin_time - diff_time, end_time - diff_time, text_array)  );
			}
		}	
	
		app.subtitleLoop( timingsArray );
	},
	subtitleLoop: function( timingsArray ) {

		var numDisplayLines = 2;
		//var timings = RiceKaraoke.simpleTimingToTiming([[1.35,3.07,[[0,"What "],[0.07,"is "],[0.28,"love"]]]]); // Simple KRL -> KRL
		var timings = RiceKaraoke.simpleTimingToTiming( timingsArray );
		
		
		app.karaoke = new RiceKaraoke(timings);
		app.renderer = new SimpleKaraokeDisplayEngine('karaoke-display', numDisplayLines);
		app.show = app.karaoke.createShow(app.renderer, numDisplayLines);

		var limit = 6 * 60; // 6分鐘 = 6 * 60 秒
		var interval = setInterval( function() {

			currentTime = Math.round ( app.player[0].currentTime *100) / 100;

			if( currentTime > limit )	clearInterval(interval);

			app.show.render(currentTime);

		}, 50);
	}

	
};


