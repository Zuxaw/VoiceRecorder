// pages navigation
let page = document.querySelectorAll(`.page`);

let navigation = {
    currentPage: 0,
    nextPage: () => {
        ++navigation.currentPage;
        page[navigation.currentPage].hidden = false;
        page[navigation.currentPage - 1].hidden = true;
    },
    previousPage: () => {
        --navigation.currentPage;
        page[navigation.currentPage].hidden = false;
        page[navigation.currentPage + 1].hidden = true;
    }
};
