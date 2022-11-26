// ==UserScript==
// @name         115一键删除'@'、'-'、']'、'最后一个-后面'、转大写
// @name:zh      115一键删除'@'、'-'、'}'、'最后一个-后面'、转大写
// @description  2022.11.26
// @author       Zccc
// @namespace    115ReName@Zccc
// @version      0.0.5
// @match        https://115.com/*
// @exclude      https://115.com/s/*


// @connect      proapi.115.com
// @connect      webapi.115.com
// @connect      115.com

// @grant        GM_setClipboard
// ==/UserScript==

'use strict';
(function () {

  async function fetchReName(id, reName) {

    let dataKey = `files_new_name[${id}]`;

    let renameUrl = "https://webapi.115.com/files/batch_rename";

    const result = await $.ajax({
      type: 'POST',
      url: renameUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      dataType: "json",
      xhrFields: {
        withCredentials: true
      },
      data: `${encodeURIComponent(dataKey)}=${encodeURIComponent(reName)}`
    });

    // 获取头部工具栏DOM
    const headerBoxDom = document.getElementById('js_top_header_file_path_box');
    // 获取头部工具栏DOM下的所有A标签
    const aTags = headerBoxDom.getElementsByTagName("a");

    for (var i = 0; i < aTags.length; i++) {
      // 找到标题标签进行刷新
      if ('show_title' === aTags[i].getAttribute('type') && aTags[i].getAttribute('onclick')) {
        aTags[i].onclick()
      }
    }

    reNameInit();
    return result;
  }

  // 添加dom及点击事件
  function addDomClick(dom, toolTip, pItem, rename) {

    dom.prependTo(toolTip);

    dom[0].addEventListener('click', async (e) => {
      fetchReName(pItem.id, rename)
    })
  }

  // 删除 @ 之前的
  function removeEmail(toolTip, pItem) {
    var $btn = $('<a ><i></i><div style="background:white"><span>删除@</span></div></a>');

    const reName = (pItem.name.slice(pItem.name.indexOf('@') + 1));

    addDomClick($btn, toolTip, pItem, reName)
  }

  // 删除 ] 之前的 部分名称前缀会以[]开头
  function removeBracketsR(toolTip, pItem) {
    var $btn = $('<a ><i></i><div style="background:white"><span>删除]</span></div></a>');
    const reName = (pItem.name.slice(pItem.name.indexOf(']') + 1));

    addDomClick($btn, toolTip, pItem, reName)
  }


  // 删除 - 之前的
  function removeBar(toolTip, pItem) {
    var $btn = $('<a ><i></i><div style="background:white"><span>删除-</span></div></a>');
    const reName = (pItem.name.slice(pItem.name.indexOf('-') + 1));

    addDomClick($btn, toolTip, pItem, reName)
  }

  // 删除 最后一个 - 之后的内容
  function removeLastBar(toolTip, pItem) {
    console.log(pItem, 'pItempItem')
    var $btn = $('<a ><i></i><div style="background:white"><span>删除尾-</span></div></a>');
    const reName = (pItem.name.slice(0, pItem.name.lastIndexOf('-')));

    addDomClick($btn, toolTip, pItem, reName)
  }

  // 转大写
  function nameToUpper(toolTip, pItem) {
    var $btn = $('<a ><div style="background:white" class="rename" rename="up"><span>转大</span></div></a>');
    const reName = pItem.name.toLocaleUpperCase('en-US')

    addDomClick($btn, toolTip, pItem, reName)
  }

  // 复制前缀
  function copyFrontPlacket(toolTip, pItem) {
    var $btn = $('<a ><div style="background:white" class="rename" rename="up"><span>复制前缀</span></div></a>');
    const reName = (pItem.name.slice(0, pItem.name.indexOf('-')));

    $btn.prependTo(toolTip);

    $btn[0].addEventListener('click', async (e) => {
      GM_setClipboard(reName);
    })
  }

  // 获取番号
  function getVideoCode(title) {
    title = title.toUpperCase().replace("SIS001", "")
      .replace("1080P", "")
      .replace("720P", "");

    let t = title.match(/T28[\-_]\d{3,4}/);
    // 一本道
    if (!t) {
      t = title.match(/1PONDO[\-_]\d{6}[\-_]\d{2,4}/);
      if (t) {
        t = t.toString().replace("1PONDO_", "")
          .replace("1PONDO-", "");
      }
    }
    if (!t) {
      t = title.match(/HEYZO[\-_]?\d{4}/);
    }
    if (!t) {
      // 加勒比
      t = title.match(/CARIB[\-_]\d{6}[\-_]\d{3}/);
      if (t) {
        t = t.toString().replace("CARIB-", "")
          .replace("CARIB_", "");
      }
    }
    if (!t) {
      // 东京热
      t = title.match(/N[-_]\d{4}/);
    }
    if (!t) {
      // Jukujo-Club | 熟女俱乐部
      t = title.match(/JUKUJO[-_]\d{4}/);
    }
    // 通用
    if (!t) {
      t = title.match(/\d+[A-Za-z]+[-_]?\d+/);
    }
    if (!t) {
      t = title.match(/[A-Z]{2,5}[-_]\d{3,5}/);
    }
    if (!t) {
      t = title.match(/\d{6}[\-_]\d{2,4}/);
    }
    if (!t) {
      t = title.match(/[A-Z]+\d{3,5}/);
    }
    if (!t) {
      t = title.match(/[A-Za-z]+[-_]?\d+/);
    }
    if (!t) {
      t = title.match(/\d+[-_]?\d+/);
    }
    if (!t) {
      t = title;
    }
    if (t) {
      t = t.toString().replace("_", "-");
      console.log("找到番号:" + t);
      return t;
    }
  }

  // 一键改名，自动复制前缀
  function oneKeyReName(toolTip, pItem) {
    var $btn = $('<a><div style="background:white;" class="rename"><span>一键改名</span></div></a>');
    let reName = getVideoCode(pItem.name)
    let regExp = new RegExp(reName + "[_-]C");
    let match = pItem.name.toUpperCase().match(regExp);

    if (match) {
      reName = reName + '-C'
    }


    $btn.prependTo(toolTip);

    $btn[0].addEventListener('click', async (e) => {
      GM_setClipboard(reName.slice(0, reName.indexOf('-')));
      fetchReName(pItem.id, reName)
    })
  }


  // 新增一个DOM避免与位置错乱
  function addDom(toolTip, LiItem) {
    var $dom = $('<div style="width:100%; height:22px;"></div>');
    removeEmail($dom, LiItem)
    removeBar($dom, LiItem)
    nameToUpper($dom, LiItem)
    removeBracketsR($dom, LiItem)
    removeLastBar($dom, LiItem)
    copyFrontPlacket($dom, LiItem)
    oneKeyReName($dom, LiItem)
    // 占位使用为了换行 style="opacity: 0;"
    $('<a style="float: none; height: 0; line-height: 0; opacity: 0;" >1</a>').appendTo(toolTip);
    $dom.appendTo(toolTip);
  }

  // 重命名初始化
  function reNameInit() {
    setInterval(() => {
      const box = document.getElementById('js_cantain_box') ? document.getElementById('js_cantain_box').getElementsByTagName('li') : '';

      if (box) {
        for (let i = 0; i < box.length; i++) {
          const itemTarget = box[i].getElementsByClassName('file-opr')[0];

          const liNode = box[i]

          var LiItem = {
            id: "",
            name: "",
            parentID: "",
          };

          var type = liNode.getAttribute("file_type");
          LiItem.name = liNode.getAttribute('title');
          LiItem.parentID = liNode.getAttribute('p_id');

          if (type == "0") {
            LiItem.id = liNode.getAttribute('cate_id');
          } else {
            LiItem.id = liNode.getAttribute('file_id');
          }

          const rName = itemTarget.getElementsByClassName('rename')

          if (!rName.length) {

            addDom(itemTarget, LiItem)
          }
        }
      }
    }, 1000)

  }

  reNameInit()

})();