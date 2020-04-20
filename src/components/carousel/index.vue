<template>
  <div
    ref="carousel-content"
    class="carousel-content"
    :style="{ height: height }"
    @mouseenter="clearAutoMove"
    @mouseleave="beginAutoMove"
  >
    <div ref="refsliderPage" class="sliderPage">
      <div
        v-for="(item, index) in carouselDataList"
        :key="index"
        class="carousel-item"
        :style="{ height: itemHeight || '100%' }"
      >
        <img class="carousel-item-img" v-if="item.isImg" :src="item.val" />
        <p v-else>{{ item.val }}</p>
      </div>
    </div>
    <div class="btn-box" :class="arrowObj">
      <div class="btn left" @click="Btnmove('toLeft')">&lt;</div>
      <div class="btn right" @click="Btnmove('toRight')">&gt;</div>
    </div>
    <div
      ref="index"
      class="sliderIndex-box"
      :class="{
        horizontal: this.direction == 'horizontal',
        vertical: this.direction == 'vertical'
      }"
    >
      <ul>
        <li
          v-for="(item, index) in dataList"
          :key="index"
          class="click-index"
          :class="{ active: index == isActive }"
          @click="Indexmove(index)"
        >
          <button></button>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { startmove } from "@/utils/move.js";
export default {
  props: {
    // 轮播数据
    dataList: {
      type: Array,
      default: () => []
    },
    //轮播图高度
    height: {
      type: String,
      default: "300px"
    },
    //自动播放间隔
    interval: {
      type: Number,
      default: 1500
    },
    //是否自动播放
    autoplay: {
      type: Boolean,
      default: true
    },
    // 箭头显示时机 always hover never
    arrow: {
      type: String,
      default: "always",
      validator: function(value) {
        return ["always", "hover", "never"].indexOf(value) !== -1;
      }
    },
    // 轮播图展示方向 水平/垂直
    direction: {
      type: String,
      default: "horizontal",
      validator: function(value) {
        return ["horizontal", "vertical"].indexOf(value) !== -1;
      }
    },
  },
  data() {
    return {
      carouselDataList: [],
      //   简易图片格式验证正则
      reg: /(.*)\.(jpg|jpeg|png)$/,
      moveLength: 0,
      isActive: 0,
      lock: true,
      timer: null,
      moveBox: null,
      nowIndex: 0,
      itemHeight: null,
    };
  },
  created() {
    this.init();
  },
  mounted() {
    this.$nextTick(() => {
      this.widthOrHeightInit();
      this.startTimer();
    });
  },
  computed: {
    //切换按钮显示规则
    arrowObj() {
      return {
        always: this.direction == "horizontal" && this.arrow == "always",
        hover: this.direction == "horizontal" && this.arrow == "hover",
        never: this.direction == "vertical" || this.arrow == "never"
      };
    }
  },
  watch: {
    // 重置方向
    direction() {
      this.clearAutoMove();
      this.widthOrHeightInit();
      this.updateIndex(0);
      this.beginAutoMove();
    }
  },
  methods: {
    //初始化数据
    init() {
      if (!this.dataList) {
        return;
      }
      this.dataList.forEach(ele => {
        let obj = { val: ele, isImg: null };
        if (this.reg.test(ele)) {
          obj.isImg = true;
        }
        this.carouselDataList.push(obj);
      });
      let first = this.carouselDataList[0];
      this.carouselDataList.push(first);
    },
    //   动态设置宽高
    widthOrHeightInit() {
      this.moveBox = this.$refs.refsliderPage;
      let refsliderPageStyle = this.$refs.refsliderPage.style;
      let faterBox = this.$refs["carousel-content"];
      let num = this.carouselDataList.length;
      if (this.direction == "horizontal") {
        refsliderPageStyle.width = num * faterBox.offsetWidth + "px";
        refsliderPageStyle.height = '100%';
        this.moveLength = faterBox.offsetWidth;
      } else {
        refsliderPageStyle.height = num * faterBox.offsetHeight + "px";
        refsliderPageStyle.width ='100%';
        this.itemHeight = faterBox.offsetHeight + "px";
        this.moveLength = faterBox.offsetHeight;
      }
        refsliderPageStyle.top = '0px';
        refsliderPageStyle.left = '0px';
    },
    // 缓冲运动 speedCoefficient ++ 缓冲减慢
    move(speedCoefficient = 7, index, callBcak = () => {}) {
      let data = {};
      if (this.direction == "horizontal") {
        data = {
          left: `-${
            index !== undefined ? index * this.moveLength : this.moveLength
          }`
        };
      } else {
        data = {
          top: `-${
            index !== undefined ? index * this.moveLength : this.moveLength
          }`
        };
      }
      startmove(this.moveBox, data, speedCoefficient, callBcak);
    },
    // index按钮点击切换
    Indexmove(index) {
      this.updateIndex(index);
      this.move(5, index);
    },
    //更新index状态
    updateIndex(index) {
      this.isActive = index;
      this.nowIndex = index;
    },
    //左右按钮点击切换
    Btnmove(direction) {
      this.autoMove(direction);
    },
    //自动轮播
    autoMove(direction) {
      if (this.lock) {
        this.lock = false;
        this.stopTimer();
        if (!direction || direction == "toRight") {
          this.updateIndex(++this.isActive);
          if (this.isActive == this.dataList.length) {
            this.isActive = 0;
          }
          this.move(direction ? 5 : 7, this.nowIndex, () => {
            // 水平轮播临界点判断
            if (
              this.direction == "horizontal" &&
              this.moveBox.offsetLeft ==
                -(this.dataList.length * this.moveLength)
            ) {
              this.updateIndex(0);
              this.moveBox.style.left = 0 + "px";
            }
            // 垂直轮播临界点判断
            if (
              this.direction == "vertical" &&
              this.moveBox.offsetTop ==
                -(this.dataList.length * this.moveLength)
            ) {
              this.updateIndex(0);
              this.moveBox.style.top = 0 + "px";
            }
            this.lock = true;
            if (direction == "toRight") {
              return;
            }
            this.startTimer();
          });
        } else if (direction == "toLeft") {
          if (this.moveBox.offsetLeft == 0) {
            this.updateIndex(this.dataList.length);
            this.moveBox.style.left = -this.isActive * this.moveLength + "px";
          }
          this.updateIndex(--this.isActive);
          this.move(direction ? 4 : 7, this.isActive, () => {
            if (this.moveBox.offsetLeft == this.isActive * this.moveLength) {
              this.updateIndex(0);
              this.moveBox.style.left = 0 + "px";
            }
            this.lock = true;
          });
        }
      }
    },
    // 开始自动轮播
    startTimer() {
      if (this.interval <= 0 || !this.autoplay) return;
      this.timer = setTimeout(this.autoMove, this.interval);
    },
    //清除定时器
    stopTimer() {
      clearTimeout(this.timer);
    },
    // 鼠标移入清除自动轮播
    clearAutoMove() {
      this.stopTimer();
    },
    // 鼠标移出恢复自动轮播
    beginAutoMove() {
      this.startTimer();
    }
  },
  beforeDestroy() {
    this.stopTimer();
  }
};
</script>
<style lang="scss" scoped>
.carousel-content {
  position: relative;
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;

  &:hover .btn {
    background-color: rgba(31, 45, 61, 0.6) !important;
  }
  &:hover .btn-box.hover {
    display: block !important;
  }

  .sliderPage {
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    font-size: 0px;

    .carousel-item {
      float: left;
      height: 100%;
      width: 500px;
      font-size: 14px;

      img {
        height: 100%;
        width: 100%;
      }

      p {
        text-align: center;
      }
    }
  }

  .btn-box {
    position: absolute;
    width: 100%;
    transform: translateY(-50%);
    top: 50%;
    &.hover,
    &.never {
      display: none;
    }

    .btn {
      border: none;
      outline: none;
      padding: 0;
      margin: 0;
      height: 36px;
      line-height: 36px;
      width: 36px;
      cursor: pointer;
      border-radius: 50%;
      background-color: rgba(31, 45, 61, 0.2);
      color: #fff;
      text-align: center;
      font-size: 20px;
      user-select: none;

      &.left {
        float: left;
      }

      &.right {
        float: right;
      }
    }
  }

  .sliderIndex-box {
    position: absolute;

    &.horizontal {
      width: 100%;
      height: 50px;
      bottom: 0px;
      text-align: center;
      line-height: 50px;
    }

    &.vertical {
      height: 100%;
      width: 50px;
      right: 0;

      ul {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);

        li {
          padding: 4px 4px;
        }
      }
    }

    li {
      display: inline-block;
      padding: 12px 4px;
      background-color: transparent;
      cursor: pointer;

      button {
        background-color: #c0c4cc;
        display: block;
        opacity: 0.48;
        width: 30px;
        height: 2px;
        border: none;
        outline: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
      }

      &.active {
        button {
          background-color: #fff;
          opacity: 1;
        }
      }
    }
  }
}
</style>
