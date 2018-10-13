var partida_numero=0;



function server1 () {
	var net=require('net');
var schedule = require('node-schedule');
var nodemailer = require('nodemailer');
var socSala=0; //Sala en la que se introduciran 4 sockets 
var numDelSocketEnSala=-1;//Usado para controlar el numero que tiene un socket dentro de una sala.
var nombre=0; //REMPLAZAR POR ID BASE DATOS
var arraySockets=[]; //Array que contendra los sockets
var arrayNumeros=[]; //Array que contendra numeros
var dineroEnJuego=1;
var dineroServidor=0; //El valor de esta variable es enviado por correo y reseteado a las 3:00 AM diario


var server=net.createServer(function(socket){

	
//ESTO SE EJECUTARA CUANDO EL CLIENTE APENAS SE CONECTE AL SERVER////////////////////////////////////////////////////////////////////
			

			numDelSocketEnSala++;

			//PROPIEDADES COMUNES QUE TENDRAN TODOS LOS SOCKETS
			socket.sala=socSala;//******Al socket entrante le asignamos el numero de sala actual.
			socket.numEnSala=numDelSocketEnSala;//******Al socket entrante le asignamos su posicion DENTRO de la sala
			socket.dinero=dineroEnJuego; //******* Dinero del socket en la sala
			socket.enJuego=false; //****** ¿El socket se encutra en pleno juego?
			socket.recibidoClosed=false;
			socket.ronda=0;//***** En que ronda se encuentra el socket

		


		
			
			//SI TODAVIA NO SE HA CREADO UNA SALA DENTRO DE ARRAYSOCKETS PUES SE CREA UNA
			if(arraySockets[socket.sala]==null){ 
				arraySockets[socket.sala]=new Array();
				arraySockets[socket.sala].push(socket);
				arraySockets[socket.sala][0].write("0");

			//SI YA HA SIDO CREADA:
			}else{


				if(arraySockets[socket.sala][0]=="NULO"){
					  //elimina 1 elemento desde el índice "index", e inserta 'nulo'
					var index = arraySockets[socket.sala].indexOf("NULO");
		   			arraySockets[socket.sala].splice(index, 1,socket);
					arraySockets[socket.sala][0].write("0");
					socket.numEnSala=0;
					

					}else if(arraySockets[socket.sala][1]=="NULO"){
					     //elimina 1 elemento desde el índice "index", e inserta 'nulo'
						var index = arraySockets[socket.sala].indexOf("NULO");
			   			arraySockets[socket.sala].splice(index, 1,socket);
						arraySockets[socket.sala][1].write("1");
						socket.numEnSala=1;
						

						

						}else if(arraySockets[socket.sala][2]=="NULO"){
							   //elimina 1 elemento desde el índice "index", e inserta 'nulo'
							var index = arraySockets[socket.sala].indexOf("NULO");
				   			arraySockets[socket.sala].splice(index, 1,socket);
							arraySockets[socket.sala][2].write("2");
							socket.numEnSala=2;
							

						

							}else {
								arraySockets[socket.sala].push(socket);
							//PASAMOS AL SOCKET EL NUMERO QUE LE CORRESPONDERA EN LA SALA
							var numEnSalaString=socket.numEnSala.toString();
							socket.write(numEnSalaString);

							}
			

				




			}

//CADA 4 SOCKET (0,1,2,3) EMPIEZA EL JUEGO (ENVIAMOS "OK") y SE CREA UNA SALA NUEVA
					
						if(arraySockets[socket.sala].length==4){
							numDelSocketEnSala=-1;
							socSala++;
							//A cada socket de la sala le enviamos "OK"
							arraySockets[socket.sala].forEach(function(elemento){
								elemento.write("OK");
								elemento.enJuego=true;
								elemento.ronda=1;
							});	

							//Despues de 1 segundo enviamos "TURNO" al primer socket del arraySockets[x]
							setTimeout(function(){
								//Al primer socket de la sala le enviamos "TURNO"
								try {
									arraySockets[socket.sala][0].write("TURNO");
							        

									
								} catch(e) {
									console.log("Error en la linea 62: no se pudo enviar TURNO al primer socket")
									console.log(e);
								}
							  	
							},1000);
							
							
		     		}
		
	
//CUANDO EL CLIENTE ENVIA DATA////////////////////////////////////////////////////////////////////////////////////////////////////////
	socket.setEncoding('utf8');
	socket.on('data',function(data){

	
		//Retransmitimos el numero recibido a todos los demas sockets	
		arraySockets[socket.sala].forEach(function(elemento){
			//Para no enviar nada al mismo que esta enviando
 			if(socket === elemento) return;
 			try {
 				elemento.write(data);
 			} catch(e) {
 				console.log(e);
 				console.log("Error en la linea 148: no se pudo retransmitir el numero recibido por el servidor a algun socket")
 			}
			

		});
	

//1>2>3	//Si el socket que envia data es el 1ro,2do o 3ro de la "sala"  entonces:
		if(socket.numEnSala<=2){
			//SI NO SE HA CREADO EL OBJETO: Creamos un nuevo objeto dentro del array 'arrayNumeros' con sus propiedades y metodos
			if(arrayNumeros[socket.sala]==null){

					//Creamos un objeto con ciertas propiedades para determinada sala
					arrayNumeros[socket.sala]={
							//Estas propiedades tomaran el numero que nos envia el socket(Tambien seran el "numero" de jugador)
							n1:0,
							n2:0,
							n3:0,
							n4:0,

							//Getter que nos retorna el numero menor del turno dentro de una sala
							get nMenor(){
								if(this.n1< this.n2 && this.n1< this.n3 && this.n1< this.n4  ){
									
									return this.n1;
									}else if(this.n2< this.n1 && this.n2< this.n3 && this.n2< this.n4){
											
											return this.n2;
										}else if(this.n3< this.n1 && this.n3< this.n2 && this.n3< this.n4){
												
												return this.n3;
											}else if(this.n4< this.n1 && this.n4< this.n2 && this.n4< this.n3){
													
													return this.n4;
												}else{
													
													return "emp";
												}
							}
						};

					
					switch (data) {
							case "10":
								arrayNumeros[socket.sala].n1=10;
								break;
							case "11":
								arrayNumeros[socket.sala].n1=11;	

								break;
							case "12":
								arrayNumeros[socket.sala].n1=12;
								break;		
							default:
								//Guardamos en n1 lo recibido del socket 1
								arrayNumeros[socket.sala].n1=data;	
								break;
						}	

			//Si YA SE CREO EL OBJETO DENTRO DEL ARRAY arrayNumeros
			}else{
				//Si no se ha introducido ningun valor en n.1,n.2,n.3  entonces introducimos alli el numero que recibimos 
					
					if(arrayNumeros[socket.sala].n1==0){
						
							switch (data) {
									case "10":
										arrayNumeros[socket.sala].n1=10;
										break;
									case "11":
										arrayNumeros[socket.sala].n1=11;	

										break;
									case "12":
										arrayNumeros[socket.sala].n1=12;	
										break;		
									default:
										//Guardamos en n1 lo recibido del socket 1
										arrayNumeros[socket.sala].n1=data;	
										break;
								}	
						//Si no hay nada en .n2
						}else if(arrayNumeros[socket.sala].n2==0){
							switch (data) {
									case "10":
										arrayNumeros[socket.sala].n2=10;
										break;
									case "11":
										arrayNumeros[socket.sala].n2=11;	

										break;
									case "12":
										arrayNumeros[socket.sala].n2=12;	
										break;		
									default:
										//Guardamos en n1 lo recibido del socket 1
										arrayNumeros[socket.sala].n2=data;	
										break;
								}
							
							//Si no hay nada en .n3
							}else if(arrayNumeros[socket.sala].n3==0){
								switch (data) {
									case "10":
										arrayNumeros[socket.sala].n3=10;
										break;
									case "11":
										arrayNumeros[socket.sala].n3=11;	
										break;
									case "12":
										arrayNumeros[socket.sala].n3=12;	
										break;		
									default:
										//Guardamos en n1 lo recibido del socket 1
										arrayNumeros[socket.sala].n3=data;	
										break;
								}
								
											
							}
			}

			//Enviamos "TURNO" al siguiente socket del array (El que viene despues del socket que envia data)(2do,3ro o 4to)
			setTimeout(function(){
				var posicionActualSocketMas1= socket.numEnSala+1;

				try {
					

					//Enviamos TURNO al siguiente socket
					arraySockets[socket.sala][posicionActualSocketMas1].write("TURNO");
					
		


				} catch(e) {
					console.log("Error en la linea 232: no se puedo enviar TURNO  al socket 2,al 3 o al 4")
					console.log(e);
				}
				
			},2000);
		
//>4	//Pero si es el 4to socket de la sala entonces:	
		//AQUI ES DONDE SE EJECUTAN LOS CALCULOS: QUIEN PIERDE; CUANTO PIERDE; SE REDISTRIBUYE EL DINERO.....!!!!!!!!!!!!!!!!
		}else if(socket.numEnSala==3){
			//Guardamos en n4 lo recibido del socket 4
			switch (data) {
					case "10":
					arrayNumeros[socket.sala].n4=10;
					break;

					case "11":
					arrayNumeros[socket.sala].n4=11;	

					break;

					case "12":
					arrayNumeros[socket.sala].n4=12;
					break;		

					default:
				    //Guardamos en n4 lo recibido del socket 4
					arrayNumeros[socket.sala].n4=data;	
					break;
			}


					//Mostrar el array con los numeros
		    		console.log(arrayNumeros[socket.sala]);

											//¿QUIEN PERDIO?>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
											switch (arrayNumeros[socket.sala].nMenor){
											
												case arrayNumeros[socket.sala].n1:


													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 50,
																	  arraySockets[socket.sala][0], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 49.50,
																	  arraySockets[socket.sala][0], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][0].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 49,
																	  arraySockets[socket.sala][0], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][0].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 48,
																	  arraySockets[socket.sala][0], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][0].dinero,2);

															//EL JUGADOR SE QUEDA CON 69.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write("LOSE");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);

														} catch(e) {
															
															console.log(e);
														}

														
													},2000);



													
													//Enviamos dinero del P2
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
												
													},3000);

													//Enviamos dinero del P3
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},4000);

													//Enviamos dinero del P4
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write("WIN");
															arraySockets[socket.sala][2].write("WIN");
															arraySockets[socket.sala][3].write("WIN");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},700);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														try {
														arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
														arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
														arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															
															console.log(e);
														}
														
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},1000);
														
														setTimeout(function(){
															try {
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
															   arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},2000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},3000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},4000);
														
													},2000);


													break;



												case arrayNumeros[socket.sala].n2:



													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 50,
																	  arraySockets[socket.sala][1], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 49.50,
																	  arraySockets[socket.sala][1], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][1].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 29%	, SE QUEDA CON 69.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 49,
																	  arraySockets[socket.sala][1], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][1].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 48,
																	  arraySockets[socket.sala][1], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][1].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write("LOSE");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
														} catch(e) {
															// statements
															console.log(e);
														}
														

														
													},2000);



													
													//Enviamos el dinero del P1 al P2
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
												
													},3000);

													//Enviamos dinero del P3 al P2
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},4000);

													//Enviamos dinero del P4 AL P2
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write("WIN");
															arraySockets[socket.sala][2].write("WIN");
															arraySockets[socket.sala][3].write("WIN");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},900);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															try {
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},1000);
														
														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
														    
														},2000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},3000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},4000);
														
													},2000);

												
													
												break;



												case arrayNumeros[socket.sala].n3:


													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 50,
																	  arraySockets[socket.sala][2], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 49.50,
																	  arraySockets[socket.sala][2], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][2].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 49,
																	  arraySockets[socket.sala][2], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][2].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 48,
																	  arraySockets[socket.sala][2], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][2].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write("LOSE");
														
														} catch(e) {
															// statements
															console.log(e);
														}


													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
														} catch(e) {
															// statements
															console.log(e);
														}
														

														
													},2000);



													
													//Enviamos el dinero del P1 al P3
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
												
													},3000);

													//Enviamos dinero del P2 al P3
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},4000);

													//Enviamos dinero del P4 AL P3
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write("WIN");
															arraySockets[socket.sala][1].write("WIN");
															arraySockets[socket.sala][3].write("WIN");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},700);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},1000);
														
														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
														    
														},2000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},3000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},4000);
														
													},2000);

																			
												break;


												case arrayNumeros[socket.sala].n4:


													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 50,
																	  arraySockets[socket.sala][3], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 49.50,
																	  arraySockets[socket.sala][3], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][3].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 49,
																	  arraySockets[socket.sala][3], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][3].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 48,
																	  arraySockets[socket.sala][3], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][3].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write("LOSE");
														} catch(e) {
															console.log("Error linea 1020: "+e);
															
														}
														

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
														} catch(e) {
															// statements
															console.log(e);
														}
														

														
													},2000);



													
													//Enviamos el dinero del P1 al P4
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
												
													},3000);

													//Enviamos dinero del P2 al P4
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},4000);

													//Enviamos dinero del P3 AL P4
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write("WIN");
															arraySockets[socket.sala][1].write("WIN");
															arraySockets[socket.sala][2].write("WIN");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},700);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},1000);
														
														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
														    
														},2000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
															
														},3000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},4000);
														
													},2000);

																							
												break;

											
												case "emp":
													

													try {
														arraySockets[socket.sala][0].write("EMP");
														arraySockets[socket.sala][1].write("EMP");
														arraySockets[socket.sala][2].write("EMP");
													    arraySockets[socket.sala][3].write("EMP");
													} catch(e) {
														// statements
														console.log(e);
													}

														

												break;
													
												};	 

										//Reiniciamos a 0  todas las "n"
										arrayNumeros[socket.sala].n1=0;
										arrayNumeros[socket.sala].n2=0;
										arrayNumeros[socket.sala].n3=0;
										arrayNumeros[socket.sala].n4=0;   

			
			
			//Aumentamos el numero de cada Ronda
			arraySockets[socket.sala].forEach(function(elemento){							
				elemento.ronda=elemento.ronda+1;
			});	


			//Si es el final de la 4ta ronda cerramos la sala con el cierre del cliente
			if(socket.ronda==5){
			//Despues de 4 segundo
			setTimeout(function(){
				partida_numero++;
				console.log("Terminada partida_numero: "+partida_numero);
				try {
					arraySockets[socket.sala].forEach(function(elemento){							
					elemento.recibidoClosed=true;
					elemento.write("closed")
					});	
				} catch(e) {
					console.log("Error en la lines 470: no se pudo enviar  Closed a algun cliente");
				}
				
			},6000);
				
			}

			//Despues de 6 segundo enviamos "TURNO" al primer socket del arraySockets[x]
			setTimeout(function(){
				try {
				 arraySockets[socket.sala][0].write("TURNO");

				} catch(e) {
					console.log("Error en la linea 479: No se pudo enviar TURNO al primer socket ")
					console.log(e);
				}
			},7000);


		
		}


			
		
	});









//CUANDO EL CLIENTE SALE/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	


	socket.on('end',function(){
		//Lo sacamos del arraySockets
		var index = arraySockets[socket.sala].indexOf(socket);
		
		//Si la longitud del array es de 3 o menos: Insertamos NULO en el elemento que sale
		if(arraySockets[socket.sala].length <= 3){
			
		  //elimina 1 elemento desde el índice "index", e inserta 'nulo'
		   arraySockets[socket.sala].splice(index, 1,"NULO");

		
			

		}else{
			//elimina 1 elemento desde el índice "index"
		   arraySockets[socket.sala].splice(index, 1);
		}
		



		//Si el socket que salio  estaba en pleno juego :			
		if(socket.enJuego==true){
			
			socket.enJuego=false;

			//Si un socket  esta en pleno juego , sale , pero ya recibio "closed" significa que esta saliendo CORRECTAMENTE
			if(socket.recibidoClosed==true){
				console.log("Legalmente ya puede salir pues recibio closed")
				console.log("socket.dinero="+socket.dinero);

			//Pero si un socket  esta en pleno juego , sale , y NO recibio "closed" significa que esta saliendo INCORRECTAMENTE
			}else {			
				
				console.log("Se salio un cliente sin haber recibido 'closed' ")
				console.log("socket.dinero del que salio= "+socket.dinero);
				
				partida_numero++;
				console.log("Terminada partida_numero: "+partida_numero);
				
				//SOCKET QUE SALIO PIERDE TODO EL DINERO EN JUEGO: 70% > OTROS JUGADORES, 30% > SERVER
				//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
				servidorSeQuedaCon(socket.dinero,30);
				// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
					reparteDinero(socket.dinero , 70,
							socket, socket.sala);
				
	


				//Enviamos "closed" a cada socket de la sala en la que se salio incorrectamente un socket  y enviamos tambien dinero actualizado
				arraySockets[socket.sala].forEach(function(elemento){

					//Para no enviar nada al mismo que esta saliendo
 					if(socket === elemento) return;
 					
 					//Enviamos su dinero actualizado a cada socket
					try {
						
						elemento.write("WIN");
						setTimeout(function(){
											   
							elemento.write(elemento.dinero.toFixed(2));
						},1000);
					} catch(e) {
						
						console.log(e);
					}
					

				

					setTimeout(function(){
					

					//Le enviamos closed al cliente android 
					try {
					elemento.write("closed");
					} catch(e) {
						
						console.log(e);
					}
					//Recibido closed? true en servidor
					elemento.recibidoClosed=true;


					},2500);



				});
	
			}

		
		   
		}else{
		//Si el socket que salio NO estaba en pleno	juego
		  numDelSocketEnSala--;
		}

		
		


		
		
	})



// SI OCURRE UN ERROR /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	socket.on('error',function(err){
		
		//Se pierde la conexion con un socket (Algun cliente apaga el Wifi o los datos)
		if (err.code == 'ECONNRESET') {
			console.log("Algun cliente perdio la conexion!");
        
    	}
	});

}).listen(9000,function(){
	console.log("Escuchando en puerto 9000 ")

});









//FUNCIONES DE PORCENTAJES%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function socketSeQuedaCon(dineroActual, porcentaje)
{
	var x=(dineroActual/100)*porcentaje;
		x=x.toFixed(2);
		x=Number(x);

  return x;
}

//FUNCION QUE CALCULA, DIVIDE Y REPARTE EL DINERO PERDIDO POR UN SOCKET
function reparteDinero(dineroActual,porcentajePerdido,socket_perdedor,sala){
	
	var dineroPerdido=(dineroActual/100)*porcentajePerdido;
	var paraCadaUno=dineroPerdido/3;
		//Limitar Decimales (Se convierte en una cadena)
		paraCadaUno=paraCadaUno.toFixed(2);
		//Convertimos la variable en un entero
		paraCadaUno=Number(paraCadaUno);
		


	//Sobreescribimos en cada socket (excepto al que perdio) el dinero ganado en el turno
	arraySockets[sala].forEach(function(elemento){
			//Para no enviar nada al mismo que esta perdiendo
 			if(socket_perdedor === elemento) return;

 				var sumatoriaCorrecta= elemento.dinero+paraCadaUno;
 					sumatoriaCorrecta=sumatoriaCorrecta.toFixed(2);
 					sumatoriaCorrecta=Number(sumatoriaCorrecta);
				
				elemento.dinero=sumatoriaCorrecta;
				
		})

}

function servidorSeQuedaCon(dineroActual,porcentaje){
	dineroServidor=dineroServidor+ (dineroActual/100)*porcentaje;
	console.log("Dinero En Servidor=" +dineroServidor);

}

//FUNCION QUE RESETEA LA VARIABLE DINERO EN SERVIDOR A LAS 3:00 AM %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


/*
 *    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└─────────────────────── second (0 - 59, OPTIsONAL)
*/


var j = schedule.scheduleJob('0 0 7 * * *', function(){
//Datos del correo
				var transporter = nodemailer.createTransport({
			  service: 'gmail',
			  auth: {
			    user: 'desarrollotecnologicoaraque@gmail.com',
			    pass: '#pinky23'
			  },
			   tls: {
			        rejectUnauthorized: false
			    }
			});
//Opciones del correo
			var mailOptions = {
		  from: 'desarrollotecnologicoaraque@gmail.com',
		  to: 'desarrollotecnologicoaraque@gmail.com',
		  subject: 'DINERO DEL SERVIDOR DEL DIA',
		   html: '<br/><b> '+"Recaudacion del servidor:  "+dineroServidor+' Bs'

		};

//Funcion que envia el correo y resetea la variable "dineroServidor"
		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error);
		  } else {
		    console.log('Email enviado! (dineroServidor reseteado a 0) ' + info.response);
		    dineroServidor=0;
		  }
		});


});


}

function server2 () {
	var net=require('net');
var schedule = require('node-schedule');
var nodemailer = require('nodemailer');
var socSala=0; //Sala en la que se introduciran 4 sockets 
var numDelSocketEnSala=-1;//Usado para controlar el numero que tiene un socket dentro de una sala.
var nombre=0; //REMPLAZAR POR ID BASE DATOS
var arraySockets=[]; //Array que contendra los sockets
var arrayNumeros=[]; //Array que contendra numeros
var dineroEnJuego=5;
var dineroServidor=0; //El valor de esta variable es enviado por correo y reseteado a las 3:00 AM diario


var server=net.createServer(function(socket){
	
//ESTO SE EJECUTARA CUANDO EL CLIENTE APENAS SE CONECTE AL SERVER////////////////////////////////////////////////////////////////////
			
			numDelSocketEnSala++;

			//PROPIEDADES COMUNES QUE TENDRAN TODOS LOS SOCKETS
			socket.sala=socSala;//******Al socket entrante le asignamos el numero de sala actual.
			socket.numEnSala=numDelSocketEnSala;//******Al socket entrante le asignamos su posicion DENTRO de la sala
			socket.dinero=dineroEnJuego; //******* Dinero del socket en la sala
			socket.enJuego=false; //****** ¿El socket se encutra en pleno juego?
			socket.recibidoClosed=false;
			socket.ronda=0;//***** En que ronda se encuentra el socket

		


		
			
			//SI TODAVIA NO SE HA CREADO UNA SALA DENTRO DE ARRAYSOCKETS PUES SE CREA UNA
			if(arraySockets[socket.sala]==null){ 
				arraySockets[socket.sala]=new Array();
				arraySockets[socket.sala].push(socket);
				arraySockets[socket.sala][0].write("0");

			//SI YA HA SIDO CREADA:
			}else{


				if(arraySockets[socket.sala][0]=="NULO"){
					  //elimina 1 elemento desde el índice "index", e inserta 'nulo'
					var index = arraySockets[socket.sala].indexOf("NULO");
		   			arraySockets[socket.sala].splice(index, 1,socket);
					arraySockets[socket.sala][0].write("0");
					socket.numEnSala=0;
					

					}else if(arraySockets[socket.sala][1]=="NULO"){
					     //elimina 1 elemento desde el índice "index", e inserta 'nulo'
						var index = arraySockets[socket.sala].indexOf("NULO");
			   			arraySockets[socket.sala].splice(index, 1,socket);
						arraySockets[socket.sala][1].write("1");
						socket.numEnSala=1;
						

						

						}else if(arraySockets[socket.sala][2]=="NULO"){
							   //elimina 1 elemento desde el índice "index", e inserta 'nulo'
							var index = arraySockets[socket.sala].indexOf("NULO");
				   			arraySockets[socket.sala].splice(index, 1,socket);
							arraySockets[socket.sala][2].write("2");
							socket.numEnSala=2;
							

						

							}else {
								arraySockets[socket.sala].push(socket);
							
							//PASAMOS AL SOCKET EL NUMERO QUE LE CORRESPONDERA EN LA SALA
							var numEnSalaString=socket.numEnSala.toString();
							socket.write(numEnSalaString);

							}
			

				




			}

//CADA 4 SOCKET (0,1,2,3) EMPIEZA EL JUEGO (ENVIAMOS "OK") y SE CREA UNA SALA NUEVA
					
						if(arraySockets[socket.sala].length==4){
							numDelSocketEnSala=-1;
							socSala++;
							//A cada socket de la sala le enviamos "OK"
							arraySockets[socket.sala].forEach(function(elemento){
								elemento.write("OK");
								elemento.enJuego=true;
								elemento.ronda=1;
							});	

							//Despues de 1 segundo enviamos "TURNO" al primer socket del arraySockets[x]
							setTimeout(function(){
								//Al primer socket de la sala le enviamos "TURNO"
								try {
									arraySockets[socket.sala][0].write("TURNO");
							       
									
								} catch(e) {
									console.log("Error en la linea 62: no se pudo enviar TURNO al primer socket")
									console.log(e);
								}
							  	
							},1000);
							
							
		     		}
		
	
//CUANDO EL CLIENTE ENVIA DATA////////////////////////////////////////////////////////////////////////////////////////////////////////
	socket.setEncoding('utf8');
	socket.on('data',function(data){

	
		//Retransmitimos el numero recibido a todos los demas sockets	
		arraySockets[socket.sala].forEach(function(elemento){
			//Para no enviar nada al mismo que esta enviando
 			if(socket === elemento) return;
 			try {
 				elemento.write(data);
 			} catch(e) {
 				console.log(e);
 				console.log("Error en la linea 148: no se pudo retransmitir el numero recibido por el servidor a algun socket")
 			}
			

		});
	

//1>2>3	//Si el socket que envia data es el 1ro,2do o 3ro de la "sala"  entonces:
		if(socket.numEnSala<=2){
			//SI NO SE HA CREADO EL OBJETO: Creamos un nuevo objeto dentro del array 'arrayNumeros' con sus propiedades y metodos
			if(arrayNumeros[socket.sala]==null){

					//Creamos un objeto con ciertas propiedades para determinada sala
					arrayNumeros[socket.sala]={
							//Estas propiedades tomaran el numero que nos envia el socket(Tambien seran el "numero" de jugador)
							n1:0,
							n2:0,
							n3:0,
							n4:0,

							//Getter que nos retorna el numero menor del turno dentro de una sala
							get nMenor(){
								if(this.n1< this.n2 && this.n1< this.n3 && this.n1< this.n4  ){
									
									return this.n1;
									}else if(this.n2< this.n1 && this.n2< this.n3 && this.n2< this.n4){
											
											return this.n2;
										}else if(this.n3< this.n1 && this.n3< this.n2 && this.n3< this.n4){
												
												return this.n3;
											}else if(this.n4< this.n1 && this.n4< this.n2 && this.n4< this.n3){
													
													return this.n4;
												}else{
													
													return "emp";
												}
							}
						};

					
					switch (data) {
							case "10":
								arrayNumeros[socket.sala].n1=10;
								
								break;
							case "11":
								arrayNumeros[socket.sala].n1=11;	
								

								break;
							case "12":
								arrayNumeros[socket.sala].n1=12;
								break;		
							default:
								//Guardamos en n1 lo recibido del socket 1
								arrayNumeros[socket.sala].n1=data;	
								break;
						}	

			//Si YA SE CREO EL OBJETO DENTRO DEL ARRAY arrayNumeros
			}else{
				//Si no se ha introducido ningun valor en n.1,n.2,n.3  entonces introducimos alli el numero que recibimos 
					
					if(arrayNumeros[socket.sala].n1==0){
						
							switch (data) {
									case "10":
										arrayNumeros[socket.sala].n1=10;
										break;
									case "11":
										arrayNumeros[socket.sala].n1=11;	

										break;
									case "12":
										arrayNumeros[socket.sala].n1=12;	
										break;		
									default:
										//Guardamos en n1 lo recibido del socket 1
										arrayNumeros[socket.sala].n1=data;	
										break;
								}	
						//Si no hay nada en .n2
						}else if(arrayNumeros[socket.sala].n2==0){
							switch (data) {
									case "10":
										arrayNumeros[socket.sala].n2=10;
										break;
									case "11":
										arrayNumeros[socket.sala].n2=11;	

										break;
									case "12":
										arrayNumeros[socket.sala].n2=12;	
										break;		
									default:
										//Guardamos en n1 lo recibido del socket 1
										arrayNumeros[socket.sala].n2=data;	
										break;
								}
							
							//Si no hay nada en .n3
							}else if(arrayNumeros[socket.sala].n3==0){
								switch (data) {
									case "10":
										arrayNumeros[socket.sala].n3=10;
										break;
									case "11":
										arrayNumeros[socket.sala].n3=11;	
										break;
									case "12":
										arrayNumeros[socket.sala].n3=12;	
										break;		
									default:
										//Guardamos en n1 lo recibido del socket 1
										arrayNumeros[socket.sala].n3=data;	
										break;
								}
								
											
							}
			}

			//Enviamos "TURNO" al siguiente socket del array (El que viene despues del socket que envia data)(2do,3ro o 4to)
			setTimeout(function(){
				var posicionActualSocketMas1= socket.numEnSala+1;

				try {
					

					//Enviamos TURNO al siguiente socket
					arraySockets[socket.sala][posicionActualSocketMas1].write("TURNO");
				
					
				


				} catch(e) {
					console.log("Error en la linea 232: no se puedo enviar TURNO  al socket 2,al 3 o al 4")
					console.log(e);
				}
				
			},2000);
		
//>4	//Pero si es el 4to socket de la sala entonces:	
		//AQUI ES DONDE SE EJECUTAN LOS CALCULOS: QUIEN PIERDE; CUANTO PIERDE; SE REDISTRIBUYE EL DINERO.....!!!!!!!!!!!!!!!!
		}else if(socket.numEnSala==3){
			//Guardamos en n4 lo recibido del socket 4
			switch (data) {
					case "10":
					arrayNumeros[socket.sala].n4=10;
					break;

					case "11":
					arrayNumeros[socket.sala].n4=11;	

					break;

					case "12":
					arrayNumeros[socket.sala].n4=12;
					break;		

					default:
				    //Guardamos en n4 lo recibido del socket 4
					arrayNumeros[socket.sala].n4=data;	
					break;
			}


					//Mostrar el array con los numeros

											//¿QUIEN PERDIO?>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
											switch (arrayNumeros[socket.sala].nMenor){
											
												case arrayNumeros[socket.sala].n1:


													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 50,
																	  arraySockets[socket.sala][0], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 49.50,
																	  arraySockets[socket.sala][0], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][0].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 49,
																	  arraySockets[socket.sala][0], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][0].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 18%, SE QUEDA CON 80%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 48,
																	  arraySockets[socket.sala][0], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][0].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write("LOSE");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
															
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},2000);



													
													//Enviamos dinero del P2
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
												
													},3000);

													//Enviamos dinero del P3
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},4000);

													//Enviamos dinero del P4
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write("WIN");
															arraySockets[socket.sala][2].write("WIN");
															arraySockets[socket.sala][3].write("WIN");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},700);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},1000);
														
														setTimeout(function(){
															try {
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},2000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},3000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},4000);
														
													},2000);


													break;



												case arrayNumeros[socket.sala].n2:

											

													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 50,
																	  arraySockets[socket.sala][1], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 49.50,
																	  arraySockets[socket.sala][1], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][1].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 49,
																	  arraySockets[socket.sala][1], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][1].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 48,
																	  arraySockets[socket.sala][1], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][1].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write("LOSE");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
														
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},2000);



													
													//Enviamos el dinero del P1 al P2
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
												
													},3000);

													//Enviamos dinero del P3 al P2
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},4000);

													//Enviamos dinero del P4 AL P2
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write("WIN");
															arraySockets[socket.sala][2].write("WIN");
															arraySockets[socket.sala][3].write("WIN");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},900);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
														arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
														arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															try {
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},1000);
														
														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
														    
														},2000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},3000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},4000);
														
													},2000);

												
													
												break;



												case arrayNumeros[socket.sala].n3:
												


													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 50,
																	  arraySockets[socket.sala][2], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 49.50,
																	  arraySockets[socket.sala][2], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][2].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 49,
																	  arraySockets[socket.sala][2], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][2].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 69.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 48,
																	  arraySockets[socket.sala][2], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][2].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write("LOSE");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
															
														} catch(e) {
															// statements
															console.log(e);
														}
														

														
													},2000);



													
													//Enviamos el dinero del P1 al P3
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
												
													},3000);

													//Enviamos dinero del P2 al P3
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},4000);

													//Enviamos dinero del P4 AL P3
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write("WIN");
															arraySockets[socket.sala][1].write("WIN");
															arraySockets[socket.sala][3].write("WIN");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},700);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},1000);
														
														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
														    
														},2000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},3000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},4000);
														
													},2000);

																			
												break;


												case arrayNumeros[socket.sala].n4:
												


													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 50,
																	  arraySockets[socket.sala][3], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 49.50,
																	  arraySockets[socket.sala][3], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][3].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 49,
																	  arraySockets[socket.sala][3], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][3].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 48,
																	  arraySockets[socket.sala][3], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][3].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write("LOSE");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
														
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},2000);



													
													//Enviamos el dinero del P1 al P4
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
												
													},3000);

													//Enviamos dinero del P2 al P4
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},4000);

													//Enviamos dinero del P3 AL P4
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write("WIN");
															arraySockets[socket.sala][1].write("WIN");
															arraySockets[socket.sala][2].write("WIN");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},700);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},1000);
														
														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
														    
														},2000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
															
														},3000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},4000);
														
													},2000);

																							
												break;

											
												case "emp":
													
													try {
														arraySockets[socket.sala][0].write("EMP");
														arraySockets[socket.sala][1].write("EMP");
														arraySockets[socket.sala][2].write("EMP");
													    arraySockets[socket.sala][3].write("EMP");
													} catch(e) {
														// statements
														console.log(e);
													}
														

												break;
													
												};	 

										//Reiniciamos a 0  todas las "n"
										arrayNumeros[socket.sala].n1=0;
										arrayNumeros[socket.sala].n2=0;
										arrayNumeros[socket.sala].n3=0;
										arrayNumeros[socket.sala].n4=0;   

			
			
			//Aumentamos el numero de cada Ronda
			arraySockets[socket.sala].forEach(function(elemento){							
				elemento.ronda=elemento.ronda+1;
			});	

			

			//Si es el final de la 4ta ronda cerramos la sala con el cierre del cliente
			if(socket.ronda==5){
			//Despues de 4 segundo
			setTimeout(function(){
				partida_numero++;
				console.log("Terminada partida_numero: "+partida_numero);
				
				try {
					arraySockets[socket.sala].forEach(function(elemento){							
					elemento.recibidoClosed=true;
					elemento.write("closed")
					});	
				} catch(e) {
					console.log("Error en la lines 470: no se pudo enviar  Closed a algun cliente");
				}
				
			},6000);
				
			}

			//Despues de 6 segundo enviamos "TURNO" al primer socket del arraySockets[x]
			setTimeout(function(){
				try {
				 arraySockets[socket.sala][0].write("TURNO");

				} catch(e) {
					console.log("Error en la linea 479: No se pudo enviar TURNO al primer socket ")
					console.log(e);
				}
			},7000);


		
		}


			
		
	});









//CUANDO EL CLIENTE SALE/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	


	socket.on('end',function(){
		//Lo sacamos del arraySockets
		var index = arraySockets[socket.sala].indexOf(socket);
		
		//Si la longitud del array es de 3 o menos: Insertamos NULO en el elemento que sale
		if(arraySockets[socket.sala].length <= 3){
			
		  //elimina 1 elemento desde el índice "index", e inserta 'nulo'
		   arraySockets[socket.sala].splice(index, 1,"NULO");

		
			

		}else{
			//elimina 1 elemento desde el índice "index"
		   arraySockets[socket.sala].splice(index, 1);
		}
		



		//Si el socket que salio  estaba en pleno juego :			
		if(socket.enJuego==true){
			
			socket.enJuego=false;

			//Si un socket  esta en pleno juego , sale , pero ya recibio "closed" significa que esta saliendo CORRECTAMENTE
			if(socket.recibidoClosed==true){
				

			//Pero si un socket  esta en pleno juego , sale , y NO recibio "closed" significa que esta saliendo INCORRECTAMENTE
			}else {			
				
				console.log("Se salio un cliente sin haber recibido 'closed' ")
				console.log("socket.dinero del que salio= "+socket.dinero);

				partida_numero++;
				console.log("Terminada partida_numero: "+partida_numero);

				//SOCKET QUE SALIO PIERDE TODO EL DINERO EN JUEGO: 70% > OTROS JUGADORES, 30% > SERVER
				//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
				servidorSeQuedaCon(socket.dinero,30);
				// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
					reparteDinero(socket.dinero , 70,
							socket, socket.sala);
				
	


				//Enviamos "closed" a cada socket de la sala en la que se salio incorrectamente un socket  y enviamos tambien dinero actualizado
				arraySockets[socket.sala].forEach(function(elemento){

					//Para no enviar nada al mismo que esta saliendo
 					if(socket === elemento) return;
 					
 					//Enviamos su dinero actualizado a cada socket
					try {
						
						elemento.write("WIN");
						setTimeout(function(){
											   
							elemento.write(elemento.dinero.toFixed(2));
						},1000);
					} catch(e) {
						
						console.log(e);
					}
					

				

					setTimeout(function(){
					

					//Le enviamos closed al cliente android 
					try {
					elemento.write("closed");
					} catch(e) {
						
						console.log(e);
					}
					//Recibido closed? true en servidor
					elemento.recibidoClosed=true;


					},2500);



				});
	
			}

		
		   
		}else{
		//Si el socket que salio NO estaba en pleno	juego
		  numDelSocketEnSala--;
		}

		
		


		
		
	})



// SI OCURRE UN ERROR /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	socket.on('error',function(err){
		
		//Se pierde la conexion con un socket (Algun cliente apaga el Wifi o los datos)
		if (err.code == 'ECONNRESET') {
			console.log("Algun cliente perdio la conexion!");
        
    	}
	});



}).listen(9001,function(){
	console.log("Escuchando en puerto 9001 ")

});









//FUNCIONES DE PORCENTAJES%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function socketSeQuedaCon(dineroActual, porcentaje)
{
	var x=(dineroActual/100)*porcentaje;
		x=x.toFixed(2);
		x=Number(x);

  return x;
}

//FUNCION QUE CALCULA, DIVIDE Y REPARTE EL DINERO PERDIDO POR UN SOCKET
function reparteDinero(dineroActual,porcentajePerdido,socket_perdedor,sala){
	
	var dineroPerdido=(dineroActual/100)*porcentajePerdido;
	var paraCadaUno=dineroPerdido/3;
		//Limitar Decimales (Se convierte en una cadena)
		paraCadaUno=paraCadaUno.toFixed(2);
		//Convertimos la variable en un entero
		paraCadaUno=Number(paraCadaUno);
		


	//Sobreescribimos en cada socket (excepto al que perdio) el dinero ganado en el turno
	arraySockets[sala].forEach(function(elemento){
			//Para no enviar nada al mismo que esta perdiendo
 			if(socket_perdedor === elemento) return;

 				var sumatoriaCorrecta= elemento.dinero+paraCadaUno;
 					sumatoriaCorrecta=sumatoriaCorrecta.toFixed(2);
 					sumatoriaCorrecta=Number(sumatoriaCorrecta);
				
				elemento.dinero=sumatoriaCorrecta;
				
		})

}

function servidorSeQuedaCon(dineroActual,porcentaje){
	dineroServidor=dineroServidor+ (dineroActual/100)*porcentaje;
	console.log("Dinero En Servidor=" +dineroServidor);

}

//FUNCION QUE RESETEA LA VARIABLE DINERO EN SERVIDOR A LAS 3:00 AM %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


/*
 *    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└─────────────────────── second (0 - 59, OPTIONAL)
*/


var j = schedule.scheduleJob('0 0 7 * * *', function(){
//Datos del correo
				var transporter = nodemailer.createTransport({
			  service: 'gmail',
			  auth: {
			    user: 'desarrollotecnologicoaraque@gmail.com',
			    pass: '#pinky23'
			  },
			   tls: {
			        rejectUnauthorized: false
			    }
			});
//Opciones del correo
			var mailOptions = {
		  from: 'desarrollotecnologicoaraque@gmail.com',
		  to: 'desarrollotecnologicoaraque@gmail.com',
		  subject: 'DINERO DEL SERVIDOR (2) DEL DIA',
		   html: '<br/><b> '+"Recaudacion del servidor:  "+dineroServidor+' Bs'

		};

//Funcion que envia el correo y resetea la variable "dineroServidor"
		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error);
		  } else {
		    console.log('Email enviado! (dineroServidor reseteado a 0) ' + info.response);
		    dineroServidor=0;
		  }
		});


});


}

function server3 () {
	var net=require('net');
var schedule = require('node-schedule');
var nodemailer = require('nodemailer');
var socSala=0; //Sala en la que se introduciran 4 sockets 
var numDelSocketEnSala=-1;//Usado para controlar el numero que tiene un socket dentro de una sala.
var nombre=0; //REMPLAZAR POR ID BASE DATOS
var arraySockets=[]; //Array que contendra los sockets
var arrayNumeros=[]; //Array que contendra numeros
var dineroEnJuego=7;
var dineroServidor=0; //El valor de esta variable es enviado por correo y reseteado a las 3:00 AM diario


var server=net.createServer(function(socket){
	
//ESTO SE EJECUTARA CUANDO EL CLIENTE APENAS SE CONECTE AL SERVER////////////////////////////////////////////////////////////////////
			


			numDelSocketEnSala++;
			

			//PROPIEDADES COMUNES QUE TENDRAN TODOS LOS SOCKETS
			socket.sala=socSala;//******Al socket entrante le asignamos el numero de sala actual.
			socket.numEnSala=numDelSocketEnSala;//******Al socket entrante le asignamos su posicion DENTRO de la sala
			socket.dinero=dineroEnJuego; //******* Dinero del socket en la sala
			socket.enJuego=false; //****** ¿El socket se encutra en pleno juego?
			socket.recibidoClosed=false;
			socket.ronda=0;//***** En que ronda se encuentra el socket

		


		
			
			//SI TODAVIA NO SE HA CREADO UNA SALA DENTRO DE ARRAYSOCKETS PUES SE CREA UNA
			if(arraySockets[socket.sala]==null){ 
				arraySockets[socket.sala]=new Array();
				arraySockets[socket.sala].push(socket);
				arraySockets[socket.sala][0].write("0");

			//SI YA HA SIDO CREADA:
			}else{


				if(arraySockets[socket.sala][0]=="NULO"){
					  //elimina 1 elemento desde el índice "index", e inserta 'nulo'
					var index = arraySockets[socket.sala].indexOf("NULO");
		   			arraySockets[socket.sala].splice(index, 1,socket);
					arraySockets[socket.sala][0].write("0");
					socket.numEnSala=0;
					

					}else if(arraySockets[socket.sala][1]=="NULO"){
					     //elimina 1 elemento desde el índice "index", e inserta 'nulo'
						var index = arraySockets[socket.sala].indexOf("NULO");
			   			arraySockets[socket.sala].splice(index, 1,socket);
						arraySockets[socket.sala][1].write("1");
						socket.numEnSala=1;
						

						

						}else if(arraySockets[socket.sala][2]=="NULO"){
							   //elimina 1 elemento desde el índice "index", e inserta 'nulo'
							var index = arraySockets[socket.sala].indexOf("NULO");
				   			arraySockets[socket.sala].splice(index, 1,socket);
							arraySockets[socket.sala][2].write("2");
							socket.numEnSala=2;
							

						

							}else {
								arraySockets[socket.sala].push(socket);
							//PASAMOS AL SOCKET EL NUMERO QUE LE CORRESPONDERA EN LA SALA
							var numEnSalaString=socket.numEnSala.toString();
							socket.write(numEnSalaString);

							}
			

				




			}

//CADA 4 SOCKET (0,1,2,3) EMPIEZA EL JUEGO (ENVIAMOS "OK") y SE CREA UNA SALA NUEVA
					
						if(arraySockets[socket.sala].length==4){
							numDelSocketEnSala=-1;
							socSala++;
							//A cada socket de la sala le enviamos "OK"
							arraySockets[socket.sala].forEach(function(elemento){
								elemento.write("OK");
								elemento.enJuego=true;
								elemento.ronda=1;
							});	

							//Despues de 1 segundo enviamos "TURNO" al primer socket del arraySockets[x]
							setTimeout(function(){
								//Al primer socket de la sala le enviamos "TURNO"
								try {
									arraySockets[socket.sala][0].write("TURNO");
							       
									
								} catch(e) {
									console.log("Error en la linea 62: no se pudo enviar TURNO al primer socket")
									console.log(e);
								}
							  	
							},1000);
							
							
		     		}
		
	
//CUANDO EL CLIENTE ENVIA DATA////////////////////////////////////////////////////////////////////////////////////////////////////////
	socket.setEncoding('utf8');
	socket.on('data',function(data){

	
		//Retransmitimos el numero recibido a todos los demas sockets	
		arraySockets[socket.sala].forEach(function(elemento){
			//Para no enviar nada al mismo que esta enviando
 			if(socket === elemento) return;
 			try {
 				elemento.write(data);
 			} catch(e) {
 				console.log(e);
 				console.log("Error en la linea 148: no se pudo retransmitir el numero recibido por el servidor a algun socket")
 			}
			

		});
	

//1>2>3	//Si el socket que envia data es el 1ro,2do o 3ro de la "sala"  entonces:
		if(socket.numEnSala<=2){
			//SI NO SE HA CREADO EL OBJETO: Creamos un nuevo objeto dentro del array 'arrayNumeros' con sus propiedades y metodos
			if(arrayNumeros[socket.sala]==null){

					//Creamos un objeto con ciertas propiedades para determinada sala
					arrayNumeros[socket.sala]={
							//Estas propiedades tomaran el numero que nos envia el socket(Tambien seran el "numero" de jugador)
							n1:0,
							n2:0,
							n3:0,
							n4:0,

							//Getter que nos retorna el numero menor del turno dentro de una sala
							get nMenor(){
								if(this.n1< this.n2 && this.n1< this.n3 && this.n1< this.n4  ){
									
									return this.n1;
									}else if(this.n2< this.n1 && this.n2< this.n3 && this.n2< this.n4){
											
											return this.n2;
										}else if(this.n3< this.n1 && this.n3< this.n2 && this.n3< this.n4){
												
												return this.n3;
											}else if(this.n4< this.n1 && this.n4< this.n2 && this.n4< this.n3){
													
													return this.n4;
												}else{
													
													return "emp";
												}
							}
						};

					
					switch (data) {
							case "10":
								arrayNumeros[socket.sala].n1=10;
								break;
							case "11":
								arrayNumeros[socket.sala].n1=11;	

								break;
							case "12":
								arrayNumeros[socket.sala].n1=12;
								break;		
							default:
								//Guardamos en n1 lo recibido del socket 1
								arrayNumeros[socket.sala].n1=data;	
								break;
						}	

			//Si YA SE CREO EL OBJETO DENTRO DEL ARRAY arrayNumeros
			}else{
				//Si no se ha introducido ningun valor en n.1,n.2,n.3  entonces introducimos alli el numero que recibimos 
					
					if(arrayNumeros[socket.sala].n1==0){
						
							switch (data) {
									case "10":
										arrayNumeros[socket.sala].n1=10;
										break;
									case "11":
										arrayNumeros[socket.sala].n1=11;	

										break;
									case "12":
										arrayNumeros[socket.sala].n1=12;	
										break;		
									default:
										//Guardamos en n1 lo recibido del socket 1
										arrayNumeros[socket.sala].n1=data;	
										break;
								}	
						//Si no hay nada en .n2
						}else if(arrayNumeros[socket.sala].n2==0){
							switch (data) {
									case "10":
										arrayNumeros[socket.sala].n2=10;
										break;
									case "11":
										arrayNumeros[socket.sala].n2=11;	

										break;
									case "12":
										arrayNumeros[socket.sala].n2=12;	
										break;		
									default:
										//Guardamos en n1 lo recibido del socket 1
										arrayNumeros[socket.sala].n2=data;	
										break;
								}
							
							//Si no hay nada en .n3
							}else if(arrayNumeros[socket.sala].n3==0){
								switch (data) {
									case "10":
										arrayNumeros[socket.sala].n3=10;
										break;
									case "11":
										arrayNumeros[socket.sala].n3=11;	
										break;
									case "12":
										arrayNumeros[socket.sala].n3=12;	
										break;		
									default:
										//Guardamos en n1 lo recibido del socket 1
										arrayNumeros[socket.sala].n3=data;	
										break;
								}
								
											
							}
			}

			//Enviamos "TURNO" al siguiente socket del array (El que viene despues del socket que envia data)(2do,3ro o 4to)
			setTimeout(function(){
				var posicionActualSocketMas1= socket.numEnSala+1;

				try {
				

					//Enviamos TURNO al siguiente socket
					arraySockets[socket.sala][posicionActualSocketMas1].write("TURNO");
	

				} catch(e) {
					console.log("Error en la linea 232: no se puedo enviar TURNO  al socket 2,al 3 o al 4")
					console.log(e);
				}
				
			},2000);
		
//>4	//Pero si es el 4to socket de la sala entonces:	
		//AQUI ES DONDE SE EJECUTAN LOS CALCULOS: QUIEN PIERDE; CUANTO PIERDE; SE REDISTRIBUYE EL DINERO.....!!!!!!!!!!!!!!!!
		}else if(socket.numEnSala==3){
			//Guardamos en n4 lo recibido del socket 4
			switch (data) {
					case "10":
					arrayNumeros[socket.sala].n4=10;
					break;

					case "11":
					arrayNumeros[socket.sala].n4=11;	

					break;

					case "12":
					arrayNumeros[socket.sala].n4=12;
					break;		

					default:
				    //Guardamos en n4 lo recibido del socket 4
					arrayNumeros[socket.sala].n4=data;	
					break;
			}


					//Mostrar el array con los numeros
		    		console.log(arrayNumeros[socket.sala]);

											//¿QUIEN PERDIO?>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
											switch (arrayNumeros[socket.sala].nMenor){
											
												case arrayNumeros[socket.sala].n1:

													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 50,
																	  arraySockets[socket.sala][0], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 49.50,
																	  arraySockets[socket.sala][0], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][0].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 49,
																	  arraySockets[socket.sala][0], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][0].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 48,
																	  arraySockets[socket.sala][0], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][0].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write("LOSE");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
														
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},2000);



													
													//Enviamos dinero del P2
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
												
													},3000);

													//Enviamos dinero del P3
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},4000);

													//Enviamos dinero del P4
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write("WIN");
														arraySockets[socket.sala][2].write("WIN");
														arraySockets[socket.sala][3].write("WIN");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},700);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},1000);
														
														setTimeout(function(){
															try {
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},2000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},3000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},4000);
														
													},2000);


													break;



												case arrayNumeros[socket.sala].n2:

										

													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 50,
																	  arraySockets[socket.sala][1], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 49.50,
																	  arraySockets[socket.sala][1], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][1].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 49,
																	  arraySockets[socket.sala][1], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][1].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 48,
																	  arraySockets[socket.sala][1], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][1].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write("LOSE");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
															
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},2000);



													
													//Enviamos el dinero del P1 al P2
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
												
													},3000);

													//Enviamos dinero del P3 al P2
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},4000);

													//Enviamos dinero del P4 AL P2
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write("WIN");
															arraySockets[socket.sala][2].write("WIN");
															arraySockets[socket.sala][3].write("WIN");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},900);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															try {
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},1000);
														
														setTimeout(function(){
															try {
																 arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
														   
														},2000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},3000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},4000);
														
													},2000);

												
													
												break;



												case arrayNumeros[socket.sala].n3:
												


													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 50,
																	  arraySockets[socket.sala][2], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 49.50,
																	  arraySockets[socket.sala][2], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][2].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 49,
																	  arraySockets[socket.sala][2], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][2].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 48,
																	  arraySockets[socket.sala][2], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][2].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write("LOSE");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);

														} catch(e) {
															// statements
															console.log(e);
														}
														
													},2000);



													
													//Enviamos el dinero del P1 al P3
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
												
													},3000);

													//Enviamos dinero del P2 al P3
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},4000);

													//Enviamos dinero del P4 AL P3
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write("WIN");
															arraySockets[socket.sala][1].write("WIN");
															arraySockets[socket.sala][3].write("WIN");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},700);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},1000);
														
														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
														    
														},2000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},3000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},4000);
														
													},2000);

																			
												break;


												case arrayNumeros[socket.sala].n4:
												


													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 50,
																	  arraySockets[socket.sala][3], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 49.50,
																	  arraySockets[socket.sala][3], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][3].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 49,
																	  arraySockets[socket.sala][3], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][3].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 48,
																	  arraySockets[socket.sala][3], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][3].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write("LOSE");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
															
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},2000);



													
													//Enviamos el dinero del P1 al P4
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
												
													},3000);

													//Enviamos dinero del P2 al P4
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},4000);

													//Enviamos dinero del P3 AL P4
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
													 	

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write("WIN");
															arraySockets[socket.sala][1].write("WIN");
															arraySockets[socket.sala][2].write("WIN");
														} catch(e) {
															// statements
															console.log(e);
														}
														

													},700);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
														} catch(e) {
															// statements
															console.log(e);
														}
														
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															try {
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},1000);
														
														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
														    
														},2000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
															
														},3000);
														

														setTimeout(function(){
															try {
																arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
																arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
															} catch(e) {
																// statements
																console.log(e);
															}
															
														},4000);
														
													},2000);

																							
												break;

											
												case "emp":
													
													try {
														arraySockets[socket.sala][0].write("EMP");
														arraySockets[socket.sala][1].write("EMP");
														arraySockets[socket.sala][2].write("EMP");
													    arraySockets[socket.sala][3].write("EMP");
													} catch(e) {
														// statements
														console.log(e);
													}
														

												break;
													
												};	 

										//Reiniciamos a 0  todas las "n"
										arrayNumeros[socket.sala].n1=0;
										arrayNumeros[socket.sala].n2=0;
										arrayNumeros[socket.sala].n3=0;
										arrayNumeros[socket.sala].n4=0;   

			
			
			//Aumentamos el numero de cada Ronda
			arraySockets[socket.sala].forEach(function(elemento){							
				elemento.ronda=elemento.ronda+1;
			});	

			

			//Si es el final de la 4ta ronda cerramos la sala con el cierre del cliente
			if(socket.ronda==5){
			//Despues de 4 segundo
			setTimeout(function(){
				partida_numero++;
				console.log("Terminada partida_numero: "+partida_numero);
				
				try {
					arraySockets[socket.sala].forEach(function(elemento){							
					elemento.recibidoClosed=true;
					elemento.write("closed")
					});	
				} catch(e) {
					console.log("Error en la lines 470: no se pudo enviar  Closed a algun cliente");
				}
				
			},6000);
				
			}

			//Despues de 6 segundo enviamos "TURNO" al primer socket del arraySockets[x]
			setTimeout(function(){
				try {
				 arraySockets[socket.sala][0].write("TURNO");

				} catch(e) {
					console.log("Error en la linea 479: No se pudo enviar TURNO al primer socket ")
					console.log(e);
				}
			},7000);


		
		}


			
		
	});









//CUANDO EL CLIENTE SALE/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	


	socket.on('end',function(){
		//Lo sacamos del arraySockets
		var index = arraySockets[socket.sala].indexOf(socket);
		
		//Si la longitud del array es de 3 o menos: Insertamos NULO en el elemento que sale
		if(arraySockets[socket.sala].length <= 3){
			
		  //elimina 1 elemento desde el índice "index", e inserta 'nulo'
		   arraySockets[socket.sala].splice(index, 1,"NULO");

		
			

		}else{
			//elimina 1 elemento desde el índice "index"
		   arraySockets[socket.sala].splice(index, 1);
		}
		



		//Si el socket que salio  estaba en pleno juego :			
		if(socket.enJuego==true){
			
			socket.enJuego=false;

			//Si un socket  esta en pleno juego , sale , pero ya recibio "closed" significa que esta saliendo CORRECTAMENTE
			if(socket.recibidoClosed==true){
				

			//Pero si un socket  esta en pleno juego , sale , y NO recibio "closed" significa que esta saliendo INCORRECTAMENTE
			}else {			
				
				console.log("Se salio un cliente sin haber recibido 'closed' ")
				console.log("socket.dinero del que salio= "+socket.dinero);

				partida_numero++;
				console.log("Terminada partida_numero: "+partida_numero);

				//SOCKET QUE SALIO PIERDE TODO EL DINERO EN JUEGO: 70% > OTROS JUGADORES, 30% > SERVER
				//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
				servidorSeQuedaCon(socket.dinero,30);
				// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
					reparteDinero(socket.dinero , 70,
							socket, socket.sala);
				
	


				//Enviamos "closed" a cada socket de la sala en la que se salio incorrectamente un socket  y enviamos tambien dinero actualizado
				arraySockets[socket.sala].forEach(function(elemento){

					//Para no enviar nada al mismo que esta saliendo
 					if(socket === elemento) return;
 					
 					//Enviamos su dinero actualizado a cada socket
					try {
						
						elemento.write("WIN");
						setTimeout(function(){
											   
							elemento.write(elemento.dinero.toFixed(2));
						},1000);
					} catch(e) {
						
						console.log(e);
					}
					

				

					setTimeout(function(){
					

					//Le enviamos closed al cliente android 
					try {
					elemento.write("closed");
					} catch(e) {
						
						console.log(e);
					}
					//Recibido closed? true en servidor
					elemento.recibidoClosed=true;


					},2500);



				});
	
			}

		
		   
		}else{
		//Si el socket que salio NO estaba en pleno	juego
		  numDelSocketEnSala--;
		}

		
		


		
		
	})



// SI OCURRE UN ERROR /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	socket.on('error',function(err){
		
		//Se pierde la conexion con un socket (Algun cliente apaga el Wifi o los datos)
		if (err.code == 'ECONNRESET') {
			console.log("Algun cliente perdio la conexion!");
        
    	}
	});



}).listen(9002,function(){
	console.log("Escuchando en puerto 9002 ")

});









//FUNCIONES DE PORCENTAJES%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function socketSeQuedaCon(dineroActual, porcentaje)
{
	var x=(dineroActual/100)*porcentaje;
		x=x.toFixed(2);
		x=Number(x);

  return x;
}

//FUNCION QUE CALCULA, DIVIDE Y REPARTE EL DINERO PERDIDO POR UN SOCKET
function reparteDinero(dineroActual,porcentajePerdido,socket_perdedor,sala){
	
	var dineroPerdido=(dineroActual/100)*porcentajePerdido;
	var paraCadaUno=dineroPerdido/3;
		//Limitar Decimales (Se convierte en una cadena)
		paraCadaUno=paraCadaUno.toFixed(2);
		//Convertimos la variable en un entero
		paraCadaUno=Number(paraCadaUno);
		


	//Sobreescribimos en cada socket (excepto al que perdio) el dinero ganado en el turno
	arraySockets[sala].forEach(function(elemento){
			//Para no enviar nada al mismo que esta perdiendo
 			if(socket_perdedor === elemento) return;

 				var sumatoriaCorrecta= elemento.dinero+paraCadaUno;
 					sumatoriaCorrecta=sumatoriaCorrecta.toFixed(2);
 					sumatoriaCorrecta=Number(sumatoriaCorrecta);
				
				elemento.dinero=sumatoriaCorrecta;
				
		})

}

function servidorSeQuedaCon(dineroActual,porcentaje){
	dineroServidor=dineroServidor+ (dineroActual/100)*porcentaje;
	console.log("Dinero En Servidor=" +dineroServidor);

}

//FUNCION QUE RESETEA LA VARIABLE DINERO EN SERVIDOR A LAS 3:00 AM %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


/*
 *    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└─────────────────────── second (0 - 59, OPTIONAL)
*/


var j = schedule.scheduleJob('0 0 7 * * *', function(){
//Datos del correo
				var transporter = nodemailer.createTransport({
			  service: 'gmail',
			  auth: {
			    user: 'desarrollotecnologicoaraque@gmail.com',
			    pass: '#pinky23'
			  },
			   tls: {
			        rejectUnauthorized: false
			    }
			});
//Opciones del correo
			var mailOptions = {
		  from: 'desarrollotecnologicoaraque@gmail.com',
		  to: 'desarrollotecnologicoaraque@gmail.com',
		  subject: 'DINERO DEL SERVIDOR (3) DEL DIA',
		   html: '<br/><b> '+"Recaudacion del servidor:  "+dineroServidor+' Bs'

		};

//Funcion que envia el correo y resetea la variable "dineroServidor"
		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error);
		  } else {
		    console.log('Email enviado! (dineroServidor reseteado a 0) ' + info.response);
		    dineroServidor=0;
		  }
		});


});


}

function server4 () {
	var net=require('net');
var schedule = require('node-schedule');
var nodemailer = require('nodemailer');
var socSala=0; //Sala en la que se introduciran 4 sockets 
var numDelSocketEnSala=-1;//Usado para controlar el numero que tiene un socket dentro de una sala.
var nombre=0; //REMPLAZAR POR ID BASE DATOS
var arraySockets=[]; //Array que contendra los sockets
var arrayNumeros=[]; //Array que contendra numeros
var dineroEnJuego=15;
var dineroServidor=0; //El valor de esta variable es enviado por correo y reseteado a las 3:00 AM diario


var server=net.createServer(function(socket){
	
//ESTO SE EJECUTARA CUANDO EL CLIENTE APENAS SE CONECTE AL SERVER////////////////////////////////////////////////////////////////////
			

		
			numDelSocketEnSala++;

			//PROPIEDADES COMUNES QUE TENDRAN TODOS LOS SOCKETS
			socket.sala=socSala;//******Al socket entrante le asignamos el numero de sala actual.
			socket.numEnSala=numDelSocketEnSala;//******Al socket entrante le asignamos su posicion DENTRO de la sala
			socket.dinero=dineroEnJuego; //******* Dinero del socket en la sala
			socket.enJuego=false; //****** ¿El socket se encutra en pleno juego?
			socket.recibidoClosed=false;
			socket.ronda=0;//***** En que ronda se encuentra el socket

		


		
			
			//SI TODAVIA NO SE HA CREADO UNA SALA DENTRO DE ARRAYSOCKETS PUES SE CREA UNA
			if(arraySockets[socket.sala]==null){ 
				arraySockets[socket.sala]=new Array();
				arraySockets[socket.sala].push(socket);
				arraySockets[socket.sala][0].write("0");

			//SI YA HA SIDO CREADA:
			}else{


				if(arraySockets[socket.sala][0]=="NULO"){
					  //elimina 1 elemento desde el índice "index", e inserta 'nulo'
					var index = arraySockets[socket.sala].indexOf("NULO");
		   			arraySockets[socket.sala].splice(index, 1,socket);
					arraySockets[socket.sala][0].write("0");
					socket.numEnSala=0;
					

					}else if(arraySockets[socket.sala][1]=="NULO"){
					     //elimina 1 elemento desde el índice "index", e inserta 'nulo'
						var index = arraySockets[socket.sala].indexOf("NULO");
			   			arraySockets[socket.sala].splice(index, 1,socket);
						arraySockets[socket.sala][1].write("1");
						socket.numEnSala=1;
						

						

						}else if(arraySockets[socket.sala][2]=="NULO"){
							   //elimina 1 elemento desde el índice "index", e inserta 'nulo'
							var index = arraySockets[socket.sala].indexOf("NULO");
				   			arraySockets[socket.sala].splice(index, 1,socket);
							arraySockets[socket.sala][2].write("2");
							socket.numEnSala=2;
							

						

							}else {
								arraySockets[socket.sala].push(socket);
							//PASAMOS AL SOCKET EL NUMERO QUE LE CORRESPONDERA EN LA SALA
							var numEnSalaString=socket.numEnSala.toString();
							socket.write(numEnSalaString);

							}
			

				




			}

//CADA 4 SOCKET (0,1,2,3) EMPIEZA EL JUEGO (ENVIAMOS "OK") y SE CREA UNA SALA NUEVA
					
						if(arraySockets[socket.sala].length==4){
							numDelSocketEnSala=-1;
							socSala++;
							//A cada socket de la sala le enviamos "OK"
							arraySockets[socket.sala].forEach(function(elemento){
								elemento.write("OK");
								elemento.enJuego=true;
								elemento.ronda=1;
							});	

							//Despues de 1 segundo enviamos "TURNO" al primer socket del arraySockets[x]
							setTimeout(function(){
								//Al primer socket de la sala le enviamos "TURNO"
								try {
									arraySockets[socket.sala][0].write("TURNO");
							        

									
								} catch(e) {
									console.log("Error en la linea 62: no se pudo enviar TURNO al primer socket")
									console.log(e);
								}
							  	
							},1000);
							
							
		     		}
		
	
//CUANDO EL CLIENTE ENVIA DATA////////////////////////////////////////////////////////////////////////////////////////////////////////
	socket.setEncoding('utf8');
	socket.on('data',function(data){

	
		//Retransmitimos el numero recibido a todos los demas sockets	
		arraySockets[socket.sala].forEach(function(elemento){
			//Para no enviar nada al mismo que esta enviando
 			if(socket === elemento) return;
 			try {
 				elemento.write(data);
 			} catch(e) {
 				console.log(e);
 				console.log("Error en la linea 148: no se pudo retransmitir el numero recibido por el servidor a algun socket")
 			}
			

		});
	

//1>2>3	//Si el socket que envia data es el 1ro,2do o 3ro de la "sala"  entonces:
		if(socket.numEnSala<=2){
			//SI NO SE HA CREADO EL OBJETO: Creamos un nuevo objeto dentro del array 'arrayNumeros' con sus propiedades y metodos
			if(arrayNumeros[socket.sala]==null){

					//Creamos un objeto con ciertas propiedades para determinada sala
					arrayNumeros[socket.sala]={
							//Estas propiedades tomaran el numero que nos envia el socket(Tambien seran el "numero" de jugador)
							n1:0,
							n2:0,
							n3:0,
							n4:0,

							//Getter que nos retorna el numero menor del turno dentro de una sala
							get nMenor(){
								if(this.n1< this.n2 && this.n1< this.n3 && this.n1< this.n4  ){
									
									return this.n1;
									}else if(this.n2< this.n1 && this.n2< this.n3 && this.n2< this.n4){
											
											return this.n2;
										}else if(this.n3< this.n1 && this.n3< this.n2 && this.n3< this.n4){
												
												return this.n3;
											}else if(this.n4< this.n1 && this.n4< this.n2 && this.n4< this.n3){
													
													return this.n4;
												}else{
													
													return "emp";
												}
							}
						};

					
					switch (data) {
							case "10":
								arrayNumeros[socket.sala].n1=10;
								break;
							case "11":
								arrayNumeros[socket.sala].n1=11;	

								break;
							case "12":
								arrayNumeros[socket.sala].n1=12;
								break;		
							default:
								//Guardamos en n1 lo recibido del socket 1
								arrayNumeros[socket.sala].n1=data;	
								break;
						}	

			//Si YA SE CREO EL OBJETO DENTRO DEL ARRAY arrayNumeros
			}else{
				//Si no se ha introducido ningun valor en n.1,n.2,n.3  entonces introducimos alli el numero que recibimos 
					
					if(arrayNumeros[socket.sala].n1==0){
						
							switch (data) {
									case "10":
										arrayNumeros[socket.sala].n1=10;
										break;
									case "11":
										arrayNumeros[socket.sala].n1=11;	

										break;
									case "12":
										arrayNumeros[socket.sala].n1=12;	
										break;		
									default:
										//Guardamos en n1 lo recibido del socket 1
										arrayNumeros[socket.sala].n1=data;	
										break;
								}	
						//Si no hay nada en .n2
						}else if(arrayNumeros[socket.sala].n2==0){
							switch (data) {
									case "10":
										arrayNumeros[socket.sala].n2=10;
										break;
									case "11":
										arrayNumeros[socket.sala].n2=11;	

										break;
									case "12":
										arrayNumeros[socket.sala].n2=12;	
										break;		
									default:
										//Guardamos en n1 lo recibido del socket 1
										arrayNumeros[socket.sala].n2=data;	
										break;
								}
							
							//Si no hay nada en .n3
							}else if(arrayNumeros[socket.sala].n3==0){
								switch (data) {
									case "10":
										arrayNumeros[socket.sala].n3=10;
										break;
									case "11":
										arrayNumeros[socket.sala].n3=11;	
										break;
									case "12":
										arrayNumeros[socket.sala].n3=12;	
										break;		
									default:
										//Guardamos en n1 lo recibido del socket 1
										arrayNumeros[socket.sala].n3=data;	
										break;
								}
								
											
							}
			}

			//Enviamos "TURNO" al siguiente socket del array (El que viene despues del socket que envia data)(2do,3ro o 4to)
			setTimeout(function(){
				var posicionActualSocketMas1= socket.numEnSala+1;

				try {
					
					//Enviamos TURNO al siguiente socket
					arraySockets[socket.sala][posicionActualSocketMas1].write("TURNO");
					
					
					


				} catch(e) {
					console.log("Error en la linea 232: no se puedo enviar TURNO  al socket 2,al 3 o al 4")
					console.log(e);
				}
				
			},2000);
		
//>4	//Pero si es el 4to socket de la sala entonces:	
		//AQUI ES DONDE SE EJECUTAN LOS CALCULOS: QUIEN PIERDE; CUANTO PIERDE; SE REDISTRIBUYE EL DINERO.....!!!!!!!!!!!!!!!!
		}else if(socket.numEnSala==3){
			//Guardamos en n4 lo recibido del socket 4
			switch (data) {
					case "10":
					arrayNumeros[socket.sala].n4=10;
					break;

					case "11":
					arrayNumeros[socket.sala].n4=11;	

					break;

					case "12":
					arrayNumeros[socket.sala].n4=12;
					break;		

					default:
				    //Guardamos en n4 lo recibido del socket 4
					arrayNumeros[socket.sala].n4=data;	
					break;
			}


					//Mostrar el array con los numeros

											//¿QUIEN PERDIO?>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
											switch (arrayNumeros[socket.sala].nMenor){
											
												case arrayNumeros[socket.sala].n1:


													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 50,
																	  arraySockets[socket.sala][0], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 49.50,
																	  arraySockets[socket.sala][0], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][0].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 49,
																	  arraySockets[socket.sala][0], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][0].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][0].dinero , 48,
																	  arraySockets[socket.sala][0], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][0].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][0].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][0].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														arraySockets[socket.sala][0].write("LOSE");

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
														} catch(e) {
															// statements
															console.log(e);
														}
													

														
													},2000);



													
													//Enviamos dinero del P2
													setTimeout(function(){
														arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
												
													},3000);

													//Enviamos dinero del P3
													setTimeout(function(){
													 	arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());

													},4000);

													//Enviamos dinero del P4
													setTimeout(function(){
													 	arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														arraySockets[socket.sala][1].write("WIN");
														arraySockets[socket.sala][2].write("WIN");
														arraySockets[socket.sala][3].write("WIN");

													},700);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
														arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
														arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
														},1000);
														
														setTimeout(function(){
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
														},2000);
														

														setTimeout(function(){
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
														},3000);
														

														setTimeout(function(){
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
														},4000);
														
													},2000);


													break;



												case arrayNumeros[socket.sala].n2:

											


													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 50,
																	  arraySockets[socket.sala][1], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 49.50,
																	  arraySockets[socket.sala][1], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][1].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 49,
																	  arraySockets[socket.sala][1], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][1].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][1].dinero , 48,
																	  arraySockets[socket.sala][1], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][1].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][1].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][1].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														arraySockets[socket.sala][1].write("LOSE");

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
														} catch(e) {
															// statements
															console.log(e);
														}
														

														
													},2000);



													
													//Enviamos el dinero del P1 al P2
													setTimeout(function(){
														arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
												
													},3000);

													//Enviamos dinero del P3 al P2
													setTimeout(function(){
													 	arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());

													},4000);

													//Enviamos dinero del P4 AL P2
													setTimeout(function(){
													 	arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														arraySockets[socket.sala][0].write("WIN");
														arraySockets[socket.sala][2].write("WIN");
														arraySockets[socket.sala][3].write("WIN");

													},900);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
														arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
														arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
														},1000);
														
														setTimeout(function(){
														    arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
														},2000);
														

														setTimeout(function(){
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
														},3000);
														

														setTimeout(function(){
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
														},4000);
														
													},2000);

												
													
												break;



												case arrayNumeros[socket.sala].n3:
												


													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 50,
																	  arraySockets[socket.sala][2], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 49.50,
																	  arraySockets[socket.sala][2], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][2].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 49,
																	  arraySockets[socket.sala][2], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][2].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][2].dinero , 48,
																	  arraySockets[socket.sala][2], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][2].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][2].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][2].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														arraySockets[socket.sala][2].write("LOSE");

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
														} catch(e) {
															// statements
															console.log(e);
														}
														

														
													},2000);



													
													//Enviamos el dinero del P1 al P3
													setTimeout(function(){
														arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
												
													},3000);

													//Enviamos dinero del P2 al P3
													setTimeout(function(){
													 	arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());

													},4000);

													//Enviamos dinero del P4 AL P3
													setTimeout(function(){
													 	arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														arraySockets[socket.sala][0].write("WIN");
														arraySockets[socket.sala][1].write("WIN");
														arraySockets[socket.sala][3].write("WIN");

													},700);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
														arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
														arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
														},1000);
														
														setTimeout(function(){
														    arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());
														},2000);
														

														setTimeout(function(){
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());
														},3000);
														

														setTimeout(function(){
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
														},4000);
														
													},2000);

																			
												break;


												case arrayNumeros[socket.sala].n4:
												


													//SI ES EL TURNO 1 EL JUGADOR PIERDE 50% y SE QUEDA CON 50%
													if(socket.ronda==1){

															//EL JUGADORE PIERDE: 50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 50,
																	  arraySockets[socket.sala][3], socket.sala);

															//EL JUGADOR SE QUEDA CON 50%
															//Despues de 0.1 segundos sobreescribimos el dinero actualizado del perdedor
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 50);
															},100);


													//SI ES EL TURNO 2 EL JUGADOR PIERDE 49.50%	, SE QUEDA CON 49.50%, SERVER SE QUEDA CON 1%
													}else if(socket.ronda==2){
															
															//EL JUGADORE PIERDE: 49.50%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 49.50,
																	  arraySockets[socket.sala][3], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][3].dinero,1);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 49.50);
															},100);

															


														//Si es el TURNO 3	 EL JUGADOR PIERDE 49%	, SE QUEDA CON 49.5%, SERVER SE QUEDA CON 1.50%
														}else if(socket.ronda==3){
															

															//EL JUGADORE PIERDE: 49%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 49,
																	  arraySockets[socket.sala][3], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][3].dinero,1.50);

															//EL JUGADOR SE QUEDA CON 49.50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 49.5);
															},100);

														//SI ES EL TURNO 4 EL JUGADOR PIERDE 48%, SE QUEDA CON 50%, SERVER SE QUEDA CON 2%
														}else if(socket.ronda==4){
															

															//EL JUGADORE PIERDE: 48%
															// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
															reparteDinero(arraySockets[socket.sala][3].dinero , 48,
																	  arraySockets[socket.sala][3], socket.sala);

															//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
															servidorSeQuedaCon(arraySockets[socket.sala][3].dinero,2);

															//EL JUGADOR SE QUEDA CON 50%
															setTimeout(function(){
																//El socket perdedor se queda con :(dineroActual, porcentaje)
																arraySockets[socket.sala][3].dinero=
																socketSeQuedaCon(arraySockets[socket.sala][3].dinero, 50);
															},100);

														}

													
													//Despues de 1 segundo enviamos "LOSE" al socket perdedor
													setTimeout(function(){
														arraySockets[socket.sala][3].write("LOSE");

													},1000);


													
													
													

													//AQUI ENVIAMOS AL CLIENTE PERDEDOR EL DINERO ACTUALIZADO  DE TODOS

													//Despues de 2 segundo enviamos el dinero que le queda al socket que perdio
													setTimeout(function(){
														try {
															arraySockets[socket.sala][3].write(arraySockets[socket.sala][3].dinero.toString());
															console.log("El player 1 tiene actualmente:  "+arraySockets[socket.sala][0].dinero);
															console.log("El player 2 tiene actualmente:  "+arraySockets[socket.sala][1].dinero);
															console.log("El player 3 tiene actualmente:  "+arraySockets[socket.sala][2].dinero);
															console.log("El player 4 tiene actualmente:  "+arraySockets[socket.sala][3].dinero);
														} catch(e) {
															// statements
															console.log(e);
														}
														

														
													},2000);



													
													//Enviamos el dinero del P1 al P4
													setTimeout(function(){
														arraySockets[socket.sala][3].write(arraySockets[socket.sala][0].dinero.toString());
												
													},3000);

													//Enviamos dinero del P2 al P4
													setTimeout(function(){
													 	arraySockets[socket.sala][3].write(arraySockets[socket.sala][1].dinero.toString());

													},4000);

													//Enviamos dinero del P3 AL P4
													setTimeout(function(){
													 	arraySockets[socket.sala][3].write(arraySockets[socket.sala][2].dinero.toString());

													},5000);

											

													//AQUI ENVIAMOS A LOS DEMAS CLIENTES SU DINERO ACTUALIZADO 
													//Despues de 0.7 segundo enviamos "WIN" a los sockets Ganadores
													setTimeout(function(){
														arraySockets[socket.sala][0].write("WIN");
														arraySockets[socket.sala][1].write("WIN");
														arraySockets[socket.sala][2].write("WIN");

													},700);

													//Despues de 1 segundo enviamos el dinero que le queda a CADA socket que GANÓ
													setTimeout(function(){
														arraySockets[socket.sala][0].write(arraySockets[socket.sala][0].dinero.toString());
														arraySockets[socket.sala][1].write(arraySockets[socket.sala][1].dinero.toString());
														arraySockets[socket.sala][2].write(arraySockets[socket.sala][2].dinero.toString());
													},1500);


													
													//AQUI ENVIAMOS A LOS DEMAS CLIENTES EL DINERO DE LOS DEMAS CLIENTES
													
													setTimeout(function(){

														setTimeout(function(){
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][0].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][0].dinero.toString());
														},1000);
														
														setTimeout(function(){
														    arraySockets[socket.sala][0].write(arraySockets[socket.sala][1].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][1].dinero.toString());
														},2000);
														

														setTimeout(function(){
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][2].dinero.toString());
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][2].dinero.toString());
															
														},3000);
														

														setTimeout(function(){
															arraySockets[socket.sala][0].write(arraySockets[socket.sala][3].dinero.toString());
															arraySockets[socket.sala][1].write(arraySockets[socket.sala][3].dinero.toString());
															arraySockets[socket.sala][2].write(arraySockets[socket.sala][3].dinero.toString());
														},4000);
														
													},2000);

																							
												break;

											
												case "emp":
													try {
														arraySockets[socket.sala][0].write("EMP");
														arraySockets[socket.sala][1].write("EMP");
														arraySockets[socket.sala][2].write("EMP");
													    arraySockets[socket.sala][3].write("EMP");
													} catch(e) {
														// statements
														console.log(e);
													}
														

												break;
													
												};	 

										//Reiniciamos a 0  todas las "n"
										arrayNumeros[socket.sala].n1=0;
										arrayNumeros[socket.sala].n2=0;
										arrayNumeros[socket.sala].n3=0;
										arrayNumeros[socket.sala].n4=0;   

			
			
			//Aumentamos el numero de cada Ronda
			arraySockets[socket.sala].forEach(function(elemento){							
				elemento.ronda=elemento.ronda+1;
			});	



			//Si es el final de la 4ta ronda cerramos la sala con el cierre del cliente
			if(socket.ronda==5){
			//Despues de 4 segundo
			setTimeout(function(){
				partida_numero++;
				console.log("Terminada partida_numero: "+partida_numero);
				try {
					arraySockets[socket.sala].forEach(function(elemento){							
					elemento.recibidoClosed=true;
					elemento.write("closed")
					});	
				} catch(e) {
					console.log("Error en la lines 470: no se pudo enviar  Closed a algun cliente");
				}
				
			},6000);
				
			}

			//Despues de 6 segundo enviamos "TURNO" al primer socket del arraySockets[x]
			setTimeout(function(){
				try {
				 arraySockets[socket.sala][0].write("TURNO");

				} catch(e) {
					console.log("Error en la linea 479: No se pudo enviar TURNO al primer socket ")
					console.log(e);
				}
			},7000);


		
		}


			
		
	});









//CUANDO EL CLIENTE SALE/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	


	socket.on('end',function(){
		//Lo sacamos del arraySockets
		var index = arraySockets[socket.sala].indexOf(socket);
		
		//Si la longitud del array es de 3 o menos: Insertamos NULO en el elemento que sale
		if(arraySockets[socket.sala].length <= 3){
			
		  //elimina 1 elemento desde el índice "index", e inserta 'nulo'
		   arraySockets[socket.sala].splice(index, 1,"NULO");

		
			

		}else{
			//elimina 1 elemento desde el índice "index"
		   arraySockets[socket.sala].splice(index, 1);
		}
		



		//Si el socket que salio  estaba en pleno juego :			
		if(socket.enJuego==true){
			
			socket.enJuego=false;

			//Si un socket  esta en pleno juego , sale , pero ya recibio "closed" significa que esta saliendo CORRECTAMENTE
			if(socket.recibidoClosed==true){
				console.log("Legalmente ya puede salir pues recibio closed")
				console.log("socket.dinero="+socket.dinero);

			//Pero si un socket  esta en pleno juego , sale , y NO recibio "closed" significa que esta saliendo INCORRECTAMENTE
			}else {			
				
				console.log("Se salio un cliente sin haber recibido 'closed' ")
				console.log("socket.dinero del que salio= "+socket.dinero);

				partida_numero++;
				console.log("Terminada partida_numero: "+partida_numero);


				//SOCKET QUE SALIO PIERDE TODO EL DINERO EN JUEGO: 70% > OTROS JUGADORES, 30% > SERVER
				//servidorSeQuedaCon(dineroActualDelPerdedor,porcentaje)
				servidorSeQuedaCon(socket.dinero,30);
				// reparteDinero(dineroActualDelPerdedor,porcentajePerdida,socket_perdedor,sala) 
					reparteDinero(socket.dinero , 70,
							socket, socket.sala);
				
	


				//Enviamos "closed" a cada socket de la sala en la que se salio incorrectamente un socket  y enviamos tambien dinero actualizado
				arraySockets[socket.sala].forEach(function(elemento){

					//Para no enviar nada al mismo que esta saliendo
 					if(socket === elemento) return;
 					
 					//Enviamos su dinero actualizado a cada socket
					try {
						
						elemento.write("WIN");
						setTimeout(function(){
											   
							elemento.write(elemento.dinero.toFixed(2));
						},1000);
					} catch(e) {
						
						console.log(e);
					}
					

				

					setTimeout(function(){
					

					//Le enviamos closed al cliente android 
					try {
					elemento.write("closed");
					} catch(e) {
						
						console.log(e);
					}
					//Recibido closed? true en servidor
					elemento.recibidoClosed=true;


					},2500);



				});
	
			}

		
		   
		}else{
		//Si el socket que salio NO estaba en pleno	juego
		  numDelSocketEnSala--;
		}

		
		


		
		
	})



// SI OCURRE UN ERROR /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	socket.on('error',function(err){
		
		//Se pierde la conexion con un socket (Algun cliente apaga el Wifi o los datos)
		if (err.code == 'ECONNRESET') {
			console.log("Algun cliente perdio la conexion!");
        
    	}
	});



}).listen(9003,function(){
	console.log("Escuchando en puerto 9003 ")

});









//FUNCIONES DE PORCENTAJES%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function socketSeQuedaCon(dineroActual, porcentaje)
{
	var x=(dineroActual/100)*porcentaje;
		x=x.toFixed(2);
		x=Number(x);

  return x;
}

//FUNCION QUE CALCULA, DIVIDE Y REPARTE EL DINERO PERDIDO POR UN SOCKET
function reparteDinero(dineroActual,porcentajePerdido,socket_perdedor,sala){
	
	var dineroPerdido=(dineroActual/100)*porcentajePerdido;
	var paraCadaUno=dineroPerdido/3;
		//Limitar Decimales (Se convierte en una cadena)
		paraCadaUno=paraCadaUno.toFixed(2);
		//Convertimos la variable en un entero
		paraCadaUno=Number(paraCadaUno);
		


	//Sobreescribimos en cada socket (excepto al que perdio) el dinero ganado en el turno
	arraySockets[sala].forEach(function(elemento){
			//Para no enviar nada al mismo que esta perdiendo
 			if(socket_perdedor === elemento) return;

 				var sumatoriaCorrecta= elemento.dinero+paraCadaUno;
 					sumatoriaCorrecta=sumatoriaCorrecta.toFixed(2);
 					sumatoriaCorrecta=Number(sumatoriaCorrecta);
				
				elemento.dinero=sumatoriaCorrecta;
				
		})

}

function servidorSeQuedaCon(dineroActual,porcentaje){
	dineroServidor=dineroServidor+ (dineroActual/100)*porcentaje;
	console.log("Dinero En Servidor=" +dineroServidor);

}

//FUNCION QUE RESETEA LA VARIABLE DINERO EN SERVIDOR A LAS 3:00 AM %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


/*
 *    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└─────────────────────── second (0 - 59, OPTIONAL)
*/


var j = schedule.scheduleJob('0 0 7 * * *', function(){
//Datos del correo
				var transporter = nodemailer.createTransport({
			  service: 'gmail',
			  auth: {
			    user: 'desarrollotecnologicoaraque@gmail.com',
			    pass: '#pinky23'
			  },
			   tls: {
			        rejectUnauthorized: false
			    }
			});
//Opciones del correo
			var mailOptions = {
		  from: 'desarrollotecnologicoaraque@gmail.com',
		  to: 'desarrollotecnologicoaraque@gmail.com',
		  subject: 'DINERO DEL SERVIDOR (4) DEL DIA',
		   html: '<br/><b> '+"Recaudacion del servidor:  "+dineroServidor+' Bs'

		};

//Funcion que envia el correo y resetea la variable "dineroServidor"
		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error);
		  } else {
		    console.log('Email enviado! (dineroServidor reseteado a 0) ' + info.response);
		    dineroServidor=0;
		  }
		});


});


}


console.log('AQUI COMIENZA LA EJECUCION');

server1();
server2();
server3();
server4();