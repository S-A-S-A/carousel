<template>
  <div class="hello">
    <div class="carousel-box">
    <carousel :dataList="dataList" :autoplay="true" :height="'300px'" :arrow="'always'" :direction="'horizontal'"></carousel>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data(){
    return{
      dataList:[
       require('@/assets/img/1.jpeg'),
       require('@/assets/img/2.jpeg'),
       require('@/assets/img/3.jpeg'),
       require('@/assets/img/4.jpeg'),
       'sasa',
        require('@/assets/img/5.jpeg'),

      ]
    }
  },
}
</script>

<style lang="scss" scoped>
  .hello{
    margin: 30px;
    display: flex;
    justify-content: center; 
    align-items: center; 
    .carousel-box{
      width: 500px;
    }
  }
</style>
