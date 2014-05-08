var findme_map = L.map('findme-map')
    .setView([-14.50, -49.14], 3),
    osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttrib = 'Dados do mapa © Contribuidores OpenStreetMap',
    osm = L.tileLayer(osmUrl, {minZoom: 2, maxZoom: 18, attribution: osmAttrib}).addTo(findme_map),
    category_data = [];
var	payment_data = [];

var findme_marker = L.marker([-14.50, -49.14], {draggable:true}).addTo(findme_map);
findme_marker.setOpacity(0);

 L.control.locate({
  follow: true
}).addTo(findme_map);


if (location.hash) location.hash = '';

$.getJSON('./categories.json').success(function(data){
    category_data = data;
});

$.getJSON('./payment.json').success(function(data){
    payment_data = data;
});


$("#category").select2({
    query: function (query) {
        var data = {results: []}, i;
        for (i = 0; i < category_data.length; i++) {
            if (query.term.length === 0 || category_data[i].toLowerCase().indexOf(query.term.toLowerCase()) >= 0) {
                data.results.push({id: category_data[i], text: category_data[i]});
            }
        }
        query.callback(data);
    }
});

$("#payment").select2({
    multiple:true,
    query:function(query) {
        var data={results:[]},i;
        for (i = 0; i < payment_data.length; i++) {
            if (query.term.length === 0 || payment_data[i].toLowerCase().indexOf(query.term.toLowerCase()) >= 0) {
                data.results.push({id: payment_data[i], text: payment_data[i]});
            }
        }

        query.callback(data);
    }
});

$("#wheel").select2({
    data: [
        {id: 'yes', text: 'Completamente acessível'},
        {id: 'limited', text: 'Parcialmente acessível'},
        {id: 'no', text: 'Não acessível'},
        {id: 'designated', text: 'Não acessível, apenas no projeto'},
        {id: 'unknown', text: 'Nível de acessibilidade desconhecido'}
    ],
    width: '85%'
});

/* search action */
$("#find").submit(function(e) {
    e.preventDefault();
    $("#couldnt-find").hide();
    var address_to_find = $("#address").val();
    if (address_to_find.length === 0) return;
    
    /* NOMINATIM PARAM */
    var qwarg_nominatim = {
        format: 'json',
        q: address_to_find
    };
    var url_nominatim = "http://nominatim.openstreetmap.org/search?" + $.param(qwarg_nominatim);
    
    /* SOLR TEST SERVER */
    var qwarg_solr = {
        wt: 'json',
        indent: 'true',
        qt: 'italian',
        q: address_to_find
    };
    var url_solr = "http://95.240.35.64:8080/solr-example/collection1/select?" + $.param(qwarg_solr);
    
    var instance='nominatim';
    
    $("#findme h4").text("Localizando...");
    $("#findme").addClass("loading");
	
	if (instance=='nominatim')
	{
		$.ajax({
		  'url': url_nominatim,
		  'success': nominatim_callback,
		  'dataType': 'jsonp',
		  'jsonp': 'json_callback'
		});
	}
	else
	{
		$.ajax({
		  'url': url_solr,
		  'success': solr_callback,
		  'dataType': 'jsonp',
		  'jsonp': 'json.wrf'
		});	
	}
});

function nominatim_callback(data){
	if (data.length > 0) {
            var chosen_place = data[0];
            console.log(chosen_place);

            var bounds = new L.LatLngBounds(
                [+chosen_place.boundingbox[0], +chosen_place.boundingbox[2]],
                [+chosen_place.boundingbox[1], +chosen_place.boundingbox[3]]);

            findme_map.fitBounds(bounds);
            findme_marker.setOpacity(1);
            findme_marker.setLatLng([chosen_place.lat, chosen_place.lon]);
            $('#instructions').html('Encontramos! Clique e arraste o marcador para o local do seu negócio, então você estará pronto para <a href="#details">adicionar à nossa lista os detalhes de sua empresa</a>.');
            $('.step-2 a').attr('href', '#details');
    }	else {
            $('#instructions').html('<strong>Não conseguimos encontrar o seu endereço.</strong> Tente descrever sua rua ou cidade com menos detalhe.');
        }
    $("#findme").removeClass("loading");
}

function solr_callback(data){
	if (data.response.docs.length > 0) {
	    var docs=data.response.docs;
		var coords=docs[0].coordinate.split(',');
            findme_marker.setOpacity(1);
            findme_marker.setLatLng([coords[0], coords[1]]);
			findme_map.setView([coords[0], coords[1]],16);
            $('#instructions').html('Encontramos! Clique e arraste o marcador para o local do seu negócio, então você estará pronto para <a href="#details">adicionar à nossa lista os detalhes de sua empresa</a>.');
            $('.step-2 a').attr('href', '#details');
    }   else {
            $('#instructions').html('<strong>Não conseguimos encontrar o seu endereço.</strong> Tente descrever sua rua ou cidade com menos detalhe.');
        }
	$("#findme").removeClass("loading");
}

/* map action */
findme_map.on('click', function(e){ 
findme_marker.setOpacity(1);
findme_marker.setLatLng(e.latlng); 
$('#instructions').html('Você ativou o marcador! Clique-o e arraste-o para o local do seu negócio, então você estará pronto para <a href="#details">adicionar à nossa lista os detalhes de sua empresa</a>.');
$('.step-2 a').attr('href', '#details');
});

$(window).on('hashchange', function() {
    if (location.hash == '#details') {
        $('#collect-data-step').removeClass('hide');
        $('#address-step').addClass('hide');
        $('#confirm-step').addClass('hide');
        $('.steps').addClass('on-2');
        $('.steps').removeClass('on-3');
    } else if (location.hash == '#done') {
        $('#confirm-step').removeClass('hide');
        $('#collect-data-step').addClass('hide');
        $('#address-step').addClass('hide');
        $('.steps').addClass('on-3');
    } else {
        $('#address-step').removeClass('hide');
        $('#collect-data-step').addClass('hide');
        $('#confirm-step').addClass('hide');
        $('.steps').removeClass('on-2');
        $('.steps').removeClass('on-3');
    }
    findme_map.invalidateSize();
});

$("#collect-data-done").click(function() {
    location.hash = '#done';

    var note_body = "Nota enviada por osmbrazil.zapto.org\n \n";
        if ($("#name").val()) note_body += "Nome: " + $("#name").val() + "\n";
        if ($("#phone").val()) note_body += "Telefone: " + $("#phone").val() + "\n";
        if ($("#website").val()) note_body += "Website: " + $("#website").val() + "\n";
        if ($("#social").val()) note_body += "Redes sociais: " + $("#social").val() + "\n";
        if ($("#opening_hours").val()) note_body += "Horário de funcionamento: " + $("#opening_hours").val() + "\n";
        if ($("#wheel").val()) note_body += "Acessibilidade para cadeirantes: " + $("#wheel").val() + "\n";
        if ($("#category").val()) note_body += "Categoria: " + $("#category").val() + "\n";
        if ($("#categoryalt").val()) note_body += "Descrição: " + $("#categoryalt").val() + "\n";
        if ($("#address").val()) note_body += "Endereço: " + $("#address").val() + "\n";
        if ($("#payment").val()) note_body += "Modos de pagamento aceitos: " + $("#payment").val() + "\n";
    var latlon = findme_marker.getLatLng();
    var qwarg = {
            lat: latlon.lat,
            lon: latlon.lng,
            text: note_body
        };
        
    $.post('http://api.openstreetmap.org/api/0.6/notes.json', qwarg, function( data ) {
		console.log( data );
		var noteId=data['properties']['id'];
		var link='http://www.openstreetmap.org/?note='+noteId+'#map=19/'+latlon.lat+'/'+latlon.lon+'&layers=N';
		$("#linkcoords").append('<a href="'+link+'">'+link+'</a>');
	});

});

function clearFields(){
	$("#name").empty();
	$("#phone").empty();
	$("#website").empty();
	$("#social").empty();
	$("#opening_hours").empty();
	$("#category").empty();
	$("#categoryalt").empty();
	$("#address").empty();
	$("#payment").empty();
	$("#wheel").empty();
	$("#linkcoords").empty();
}

clearFields();
