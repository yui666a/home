let abst_profile = "<b>相曽　結（AISO, Hitoshi）</b><br /><span>　長岡技術科学大学　工学部<br />　情報・経営システム工学課程　４年</span><br />　知識システム研究室所属<br /><br />2020/4<br />　長岡技術科学大学 工学部 情報・経営システム工学課程 編入学<br />2020/3<br />　奈良工業高等専門学校 情報工学科 卒業<br />2016/8<br />　10ヶ月間，アメリカ オハイオ州 Lakeside High Schoolに交換留学<br />2014/4<br />　奈良工業高等専門学校 情報工学科 入学<br />";
let abst_research = "現在<br />文書中の暗示的怒りの検出に関する研究<br />高専時代<br />VRを用いた半導体教育に関する研究<br />";



document.getElementById("PROFILE").onclick = function() {
    document.getElementById("display").innerHTML = abst_profile;
  };
  document.getElementById("RESEARCH").onclick = function() {
    document.getElementById("display").innerHTML = abst_research;
  };