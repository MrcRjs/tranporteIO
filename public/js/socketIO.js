$(document).ready(function(){

	var socket = io();
	$('form').submit(function(){

		socket.emit('BusAlert',$('#location').val());
		$('#location').val('');

		$('#okDiv').show('slow')

		return false;

	})

	socket.on('BusAlert', function (msg){
		$('#AlertList').append($('<a class="list-group-item">'+msg+'<button class="btn btn-primary">Asistir Alerta</button></a>'));
	})

})