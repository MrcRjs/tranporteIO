module.exports =(function (app){
		
	app.get('/AlertModule', function (req, res){

		res.render('alertBusModule');

	})

	app.get('/AlertCarModule', function (req, res){

		res.render('alertCarModule');

	})

})