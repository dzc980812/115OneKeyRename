// ==UserScript==
// @name         115一键删除'@'、'-'、']'、'最后一个-后面'、转大写
// @name:zh      115一键删除'@'、'-'、'}'、'最后一个-后面'、转大写
// @description  2022.11.14
// @author       Zccc
// @namespace    115ReName@Zccc
// @version      0.0.3
// @match        https://115.com/*
// @exclude      https://115.com/s/*


// @connect      proapi.115.com
// @connect      webapi.115.com
// @connect      115.com


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
  function addDomClick(dom, toopTip, pItem, rename) {

    dom.prependTo(toopTip);

    dom[0].addEventListener('click', async (e) => {
      fetchReName(pItem.id, rename)
    })
  }

  // 删除 @ 之前的
  function removeEmail(toopTip, pItem) {
    var $btn = $('<a ><i></i><div style="background:white"><span>删除@</span></div></a>');

    const reName = (pItem.name.slice(pItem.name.indexOf('@') + 1));

    addDomClick($btn, toopTip, pItem, reName)
  }

  // 删除 ] 之前的 部分名称前缀会以[]开头
  function removeBracketsR(toopTip, pItem) {
    var $btn = $('<a ><i></i><div style="background:white"><span>删除]</span></div></a>');
    const reName = (pItem.name.slice(pItem.name.indexOf(']') + 1));

    addDomClick($btn, toopTip, pItem, reName)
  }


  // 删除 - 之前的
  function removeBar(toopTip, pItem) {
    var $btn = $('<a ><i></i><div style="background:white"><span>删除-</span></div></a>');
    const reName = (pItem.name.slice(pItem.name.indexOf('-') + 1));

    addDomClick($btn, toopTip, pItem, reName)
  }

  // 删除 最后一个 - 之后的内容
  function removeLastBar(toopTip, pItem) {
    console.log(pItem, 'pItempItem')
    var $btn = $('<a ><i></i><div style="background:white"><span>删除尾-</span></div></a>');
    const reName = (pItem.name.slice(0, pItem.name.lastIndexOf('-')));

    addDomClick($btn, toopTip, pItem, reName)
  }

  // 转大写
  function nameToUpper(toopTip, pItem) {
    var $btn = $('<a ><div style="background:white" class="rename" rename="up"><span>转大</span></div></a>');
    const reName = pItem.name.toLocaleUpperCase('en-US')

    addDomClick($btn, toopTip, pItem, reName)
  }

  // 新增一个DOM避免与位置错乱
  function addDom(toopTip, LiItem) {
    var $dom = $('<div style="width:100%; height:22px;"></div>');
    removeEmail($dom, LiItem)
    removeBar($dom, LiItem)
    nameToUpper($dom, LiItem)
    removeBracketsR($dom, LiItem)
    removeLastBar($dom, LiItem)
    $dom.prependTo(toopTip);
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