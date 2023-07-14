const axios = require('axios')

async function getInterviewHot() {
  return new Promise(async (resolve) => {
    const defaultInterviewHot = [
      {
        title: '使用canvas绘制一个扇形',
        issuesId: 0,
        label: 'html',
        count: 1,
      },
      {
        title: '页面导入样式时，使用link和@import有什么区别？',
        issuesId: 1,
        label: 'html',
        count: 136,
      },
      {
        title: '圣杯布局和双飞翼布局的理解和区别，并用代码实现',
        issuesId: 2,
        label: 'css',
        count: 57,
      },
      {
        title: '用递归算法实现，数组长度为5且元素的随机数在2-32间不重复的值',
        issuesId: 3,
        label: 'js',
        count: 504,
      },
      {
        title: 'html的元素有哪些（包含H5）？',
        issuesId: 4,
        label: 'html',
        count: 57,
      },
      {
        title: 'CSS3有哪些新增的特性？',
        issuesId: 5,
        label: 'css',
        count: 40,
      },
      {
        title: '写一个方法去掉字符串中的空格',
        issuesId: 6,
        label: 'js',
        count: 160,
      },
      {
        title: 'HTML全局属性(global attribute)有哪些（包含H5）？',
        issuesId: 7,
        label: 'html',
        count: 30,
      },
      {
        title: '在页面上隐藏元素的方法有哪些？',
        issuesId: 8,
        label: 'css',
        count: 48,
      },
      {
        title: '去除字符串中最后一个指定的字符',
        issuesId: 9,
        label: 'js',
        count: 137,
      },
      {
        title: 'HTML5的文件离线存储怎么使用，工作原理是什么？',
        issuesId: 10,
        label: 'html',
        count: 27,
      },
      {
        title: 'CSS选择器有哪些？哪些属性可以继承？',
        issuesId: 11,
        label: 'css',
        count: 26,
      },
    ]
    const res = await axios
      .get('http://api.h-camel.com/api?mod=interview&ctr=issues&act=hot')
      .catch((error) => {
        return resolve(defaultInterviewHot)
      })
    if (res.status == 200) {
      const data = res.data.result
      if (data && data.length) {
        return resolve(data)
      }
    }
    return resolve(defaultInterviewHot)
  })
}

module.exports = {
  getInterviewHot,
}
