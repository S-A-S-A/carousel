import Carousel from './index.vue';

const  carousel = {
    install: (vue)=>{
        vue.component('carousel',Carousel);
    }
}

export default carousel