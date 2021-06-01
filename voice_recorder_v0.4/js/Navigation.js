// navigation dans les pages

let page = document.querySelectorAll('.page')

var navigation = {
    currentPage: 0,
    nextPage :function(){
        navigation.currentPage ++
        page[navigation.currentPage].hidden = false
        page[navigation.currentPage-1].hidden = true
    },
    previousPage :function(){
        navigation.currentPage --
        page[navigation.currentPage].hidden = false
        page[navigation.currentPage+1].hidden = true
    }
};
