/**
 * Select2 Italian translation
 */
(function ($) {
    "use strict";

    $.extend($.fn.select2.defaults, {
        formatNoMatches: function () { return "Nenhum resultado encontrado"; },
        formatInputTooShort: function (input, min) { var n = min - input.length; return "Digite mais " + n + " caracter" + (n == 1? "e" : "es"); },
        formatInputTooLong: function (input, max) { var n = input.length - max; return "Digite " + n + " caracter" + (n == 1? "e" : "es") + " a menos"; },
        formatSelectionTooBig: function (limit) { return "É possível selecionar somente até " + limit + " element" + (limit == 1 ? "o" : "os"); },
        formatLoadMore: function (pageNumber) { return "Carregando..."; },
        formatSearching: function () { return "Pesquisando..."; }
    });
})(jQuery);
