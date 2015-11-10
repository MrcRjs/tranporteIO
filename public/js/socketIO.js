$(document).ready(function(){

	var socket = io();
	$('form').submit(function(){

		var date = new Date();
		var time = date.getHours() +' : '+date.getMinutes();
		var msg = { location: $('#location').val(), unidad: 'Unidad 10-SD', time:  time }

		socket.emit('BusAlert', msg);
		$('#location').val('');

		$('#okDiv').show('slow')

		window.setTimeout(hide, 2200);

		function hide (){
			$('#okDiv').hide('slow')
		}

		return false;

	})

	socket.on('BusAlert', function (msg){
		
		var audio = new Audio('../sounds-928-gentle-alarm.mp3');
		audio.play();

		$('#AlertList').append($('<a class="list-group-item" href="#" align="center">Alerta de: <strong>'+msg.unidad+'</strong> con ubicación cercana a la estación: <strong>'+msg.location+'</strong> a las: <strong>'+msg.time+'</strong> horas</a>'));

	})

})