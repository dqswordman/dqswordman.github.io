import { section as s, periods } from './schema.mjs';

const chapter = (id, summary, sections, events) => ({ ...periods.find((period) => period.id === id), summary, sections, events });
const theme = (id, title, summary, sections, events) => ({ id, title, summary, sections, events });

export const chapters = [
  chapter('opening', '以1840年战争为主要起点，先解释此前的贸易、财政与帝国秩序，再看军事冲击如何变成长期条约制度。', [
    s('危机发生在既有世界中', '十九世纪前期的清朝并非与外界完全隔绝，广州贸易、亚洲海路及白银流动早已连接帝国与全球市场。英国工业、海军与殖民扩张改变力量条件，鸦片则把商业利润与中国社会、财政问题连接。禁烟冲突是战争的直接背景，英国使用武力扩大商业和外交利益是具体政治选择，不能写成现代化必然需要的开门仪式。', ['opium-trade', 'opium-war']),
    s('从战争到不平等的规则', '南京条约及随后条约增加口岸、赔款与其他特权，领事裁判等安排来自不同文件，不应全塞进1842年一个条约。新体系影响商业、司法与地方社会，沿海居民既可能获得贸易机会，也承受侵占和制度不平等。第二次鸦片战争进一步冲击北京，驻京外交和新的通商条件使清廷必须常设处理对外事务。', ['nanjing-treaty', 'wangxia', 'opium-second']),
    s('内外不能切成两条互不相关的线', '人口、地方治理和内战压力影响财政与军队，对外战争又加深国家资源紧张。官员通过翻译和资料编纂认识世界，却仍在帝国政治伦理中行动。后来的改革因此既是对外学习，也是在国内社会危机中重建统治。', ['qing-overview', 'feng-guifen']),
  ], ['canton-opium', 'first-opium-war', 'treaty-system', 'second-opium-war']),
  chapter('crisis', '十九世纪中叶的大规模内战、族群冲突与自然灾害交织，地方军政崛起和技术自强同时改变帝国结构。', [
    s('内战的社会根源和代价', '太平天国动员宗教、土地和社会不满，清廷则借地方士绅及募勇重建军事力量。双方都形成强制秩序并造成严重平民伤害。西北战争又包含不同地方、宗教及族群关系，不能把整个群体写成天然叛乱者。战争导致人口损失、迁徙和地方权力重组，影响远超过首领的胜负。', ['taiping-program', 'northwest-famine', 'military-lateqing']),
    s('自强不是只买武器', '船政、军工、轮船、电报、学校和翻译需要财政、人才及管理制度配套。地方督抚和官商合作提供资源，也产生部门分割、监督不足和目标冲突。技术引进取得真实成果，却难以自动解决中央地方协调、军事训练和国家预算问题。甲午战争的失利暴露了这种能力与组织之间的差距。', ['feng-guifen', 'military-lateqing', 'sino-japanese']),
    s('灾害揭示治理', '华北大饥荒及西北饥荒使交通、市场、赈济和社会组织成为生死条件。灾难不能只写成天气异常，救济资源如何分配、官员如何报告和居民能否迁移都影响死亡。民间慈善与国际救济的扩展也改变社会联系。', ['famine-1876', 'northwest-famine']),
  ], ['taiping', 'self-strengthening', 'northwest-conflicts', 'xinjiang-crisis', 'north-china-famine', 'sino-french-war', 'sino-japanese-war']),
  chapter('reform', '甲午失败以后，制度改革、革命、女性解放和殖民地经验共同塑造对未来中国的竞争性想象。', [
    s('国家危机推动多种方案', '1895年以后割地、赔款及列强扩张强化危机感，维新者主张行政教育和制度调整，革命者逐渐寻求推翻清朝。1898年变法与政变说明改革触及实际权力，并非有正确建议就能自然落实。知识通过日本、港口和海外社群传播，新政治词汇也在翻译中改变。', ['kang-memorial', 'yan-fu', 'liang-renewal']),
    s('暴力与改革的转折', '义和团中的反侵略情绪、宗教冲突和对平民的暴力，与列强侵略、报复及清廷误判交叠。庚子失败后新政、废科举、新军和预备立宪迅速推进，新机构既增强国家能力，也产生不受旧秩序控制的行动者。改革并非只因不够早，更涉及财政、代表性及族群政治。', ['boxer-origins', 'boxer-siege', 'qing-edict']),
    s('谁被包括进新国家', '女性教育、婚姻与劳动的争论揭示国家富强之外的个人解放问题；台湾在日本殖民下经历建设、剥削和反抗，原住民族处境更不能由汉人叙述替代。辛亥结束帝制，但共和如何包容这些社会和地区差异仍未解决。', ['hezhen', 'wushe-overview', 'revolution-1911']),
  ], ['reform-1898', 'boxer-uprising', 'new-policies', 'education-reform', 'constitutional-reform', 'women-emancipation', 'xinhai-revolution', 'taiwan-colonial']),
  chapter('republic', '共和国建立后，军事资源、议会规则与地方权力的失衡，使制度建设和思想革新同时走向激烈争论。', [
    s('共和没有现成的国家能力', '清帝退位减少部分战争风险，南京与北京的权力过渡却没有建立稳定的军队和财政约束。宋教仁组织议会政党，袁世凯依赖北洋资源集权，刺杀、二次革命及称帝破坏程序信任。护国成功阻止帝制，也没有使地方军队自动退出政治。', ['revolution-1911', 'song-assassination', 'republic-sources']),
    s('世界战争与主权诉求', '日本二十一条要求加深反帝情绪，中国参加第一次世界大战，华工承担危险劳动。巴黎和会山东问题说明参战和法理论证不能自动克服大国力量差距。五四既有学生政治，也有商人、工人及城市社会的参与。', ['twentyone-doc', 'ww1-politics', 'labour-corps', 'mayfourth-archives']),
    s('文化批评的开放性', '新文化反思伦理、语言、知识与权威，陈独秀、胡适、鲁迅等主张并不完全相同。科学、民主、社会主义及自由主义也不是一开始便合成统一路线。应保留当时道路的未定性，避免把文化运动只当作后来某党历史的序章。', ['chen-awakening', 'hu-civilization', 'republic-sources']),
  ], ['republic-1912', 'second-revolution', 'twenty-one-demands', 'yuan-monarchy', 'new-culture', 'ww1-china', 'may-fourth']),
  chapter('revolution', '政党组织、苏联和共产国际、劳工及农民动员进入政治中心，联合革命随后在暴力分裂中转向不同道路。', [
    s('组织化的新政治', '共产党早期小组与全国组织在跨地区知识和劳工网络中形成，国民党改组并建立党军。第一次国共合作试图把军事、政党和社会动员结合，双方目标和组织自主性却不一致。苏联及共产国际提供资源和路线影响，不能把中国参与者当作没有自身判断的工具。', ['ccp-formation', 'unitedfront-study', 'sun-stages']),
    s('城市劳工与北伐', '五卅等事件使反帝、劳动条件及民族工业诉求交织。北伐依靠军队，也依赖财政、交通、农民和工人支持；东北及地方经济资源影响各派竞争。群众动员扩大政治参与，也使地方精英、军官和企业对社会革命产生恐惧。', ['may30-study', 'northern-finance']),
    s('1927年的断裂', '蒋介石及其他国民党力量清共，武汉合作随后破裂，大量共产党人、工人和其他参与者遭杀害。中共路线、共产国际判断及军事资源不足亦影响失败，但不能把镇压责任转给受害者。此后农村武装与根据地成为主要探索，城市运动并未从社会史中消失。', ['split-1927', 'mao-peasants', 'accidental-holyland']),
  ], ['ccp-founding', 'first-united-front', 'may-thirtieth', 'northern-expedition', 'split-1927', 'rural-revolution']),
  chapter('state', '南京政府建设国家制度，中共发展农村根据地，日本侵略不断升级，多种国家与社会秩序在同一时期竞争。', [
    s('建设与限制', '南京政府推进关税、交通、金融、法律和教育，地方军队、税源及日本扩张限制其能力。党国体制和新生活运动强调纪律，政治镇压及不平等又损害合法性。不能把这一时期只称为黄金十年，也不能否认其具体建设。', ['nanjing-decade', 'chiang-newlife']),
    s('农村革命的非直线道路', '中共根据地经历土地政策、军事围剿和内部斗争，长征是严重失败下的转移，也是力量重组。西北地方社会及组织条件使幸存者获得新空间，不能把结局倒写为事先规划的完美战略。民众既参与动员，也承受战争、征粮和阶级政治。', ['mao-early', 'long-march', 'accidental-holyland']),
    s('侵略与抗日合作', '九一八及满洲国建立改变东北社会和国际秩序，华北压力继续增加。中央对日和剿共路线引发不满，西安事变促使国共关系转向。合作不是双方全部矛盾消失，而是侵略压力下的新政治安排。', ['mukden', 'accidental-holyland', 'xian-site']),
  ], ['nanjing-state', 'mukden-1931', 'long-march', 'xian-incident']),
  chapter('war', '全面抗战是一场国际战争，也是对家庭、劳动、教育和社会秩序的长期重塑。', [
    s('抵抗与占领', '1937年后战场扩展，国民政府军队承担主要正面会战，中共及其他力量进行敌后抵抗，日本占领区又形成合作、抵抗和日常求生。贡献不能简单相加为党派功劳分数，行动、资源和责任应在具体地区核实。南京暴行有充分证据，数字争论不构成否认理由。', ['resistance-war', 'nanjing-archive', 'wang-collaboration']),
    s('战争的社会成本', '迁校、迁厂和国际救济维持部分社会能力，轰炸、征兵征粮、黄河决堤和河南饥荒又使民众承受巨大损失。军事必要的主张需要检验，决策者不能因抗战目标正当便免于对平民伤害负责。妇女、儿童和难民的经历是战争主体内容。', ['yellowriver-1938', 'vautrin-diary', 'resistance-war']),
    s('合作中的竞争与国际化', '国共摩擦、皖南事变及延安整风说明国内权力竞争没有停止。太平洋战争后中国国际地位提升，废约、开罗及联合国安排形成新秩序。1945年日本投降带来胜利，却未终结国内战争和受害者困境。', ['rectification-study', 'cairo', 'potsdam']),
  ], ['full-scale-war', 'nanjing-atrocities', 'war-1938', 'wartime-society', 'wang-regime', 'new-fourth-army', 'yanan-rectification', 'wartime-alliance']),
  chapter('transition', '1945年的胜利没有产生稳定和平。协商、军队、土地和货币危机共同推动大陆政权更替与两岸分治。', [
    s('重建的机会与困难', '接收、复员、遣返、难民和财产处置需要巨大行政能力。重庆谈判、政协及外部调停一度提供和平框架，但军队整编和区域控制缺少可信保障，各方对先退让的风险深感不安。民主党派和社会和平诉求不能被两党竞争遮蔽。', ['truman-china', 'civilwar-study']),
    s('土地、财政和战争', '土地改革重组农村权力，既产生支持也造成运动暴力。国民政府通胀和金圆券失败侵蚀城市信任，双方征发和围困又加重平民苦难。战役胜负与这些社会经济条件相互影响，不能仅以将领天才或道德好坏解释。', ['land-mao-liu', 'land-property', 'civilwar-study']),
    s('台湾及分治', '台湾接收初期失序、抗议与二二八镇压造成深重创伤。1949年国民党政府退台并强化戒严，大陆建立中华人民共和国。政治合法性及家庭联系在冷战中被重新切割，许多战争和权利问题并未在建国仪式中解决。', ['228-truth', 'taiwan-republic', 'civilwar-us']),
  ], ['war-end-1945', 'chongqing-talks', 'land-reform-civilwar', 'taiwan-228', 'civil-war', 'prc-founding']),
  chapter('founding', '新国家通过行政整合、战争动员和所有制变化建立强大组织能力，同时以政治运动和强制重组社会。', [
    s('国家能力与群众运动', '土地改革、镇反和三反五反使新政权迅速进入城乡，财政与货币整合改善部分秩序。公开控诉和指标也把复杂社会关系变为政治身份，程序不足导致严重暴力。受益、支持与恐惧可以在同一社会同时存在。', ['early-prc-campaigns', 'political-violence']),
    s('冷战与边疆', '朝鲜战争使中国与美国直接交战，巩固中朝关系又加重经济和安全负担。西藏的军事、协议与后续冲突改变地方政教和社会关系。国家统一、国际承认及居民权利是相关但不同的问题，不能只使用中央或外部强权的单一视角。', ['korea-history', 'tibet-agreement', 'tibet-coldwar']),
    s('工业和制度', '一五计划、苏联合作和1954年宪法建立新的工业行政框架，农业及工商改造改变所有制。重工业增长与居民消费、农民自主和城乡分配之间存在权衡。国家能力增强并不必然形成限制最高权力的机制。', ['sino-soviet', 'constitution', 'resolution-1981']),
  ], ['land-and-campaigns', 'korean-war', 'tibet-1951-1959', 'socialist-transformation']),
  chapter('campaigns', '反右、大跃进和文革使信息、权力与生命安全严重失衡，外交和科研又在危机中出现重要转向。', [
    s('纠错为何失灵', '反右使公共批评承担政治风险，大跃进的高指标、虚报和僵硬征购由此难以纠正。庐山会议压制批评，饥荒继续加深。领导路线、制度激励和地方行为共同作用，自然因素或苏联撤援不能替代对国内政策责任的分析。', ['famine-institutions', 'political-violence', 'resolution-1981']),
    s('文革的不同阶段', '1966年动员、派性夺权、武斗及后来国家重建中的清洗有不同暴力机制。教育、家庭和职业遭长期破坏，部分工业科研继续存在也不能抵销迫害。县志、回忆和档案各有缺失，人数估计必须保留样本和基线限制。', ['cultural-revolution-impact', 'political-campaign-databases']),
    s('安全与世界', '中苏分裂、中印战争和国防压力推动三线建设与重点科研。两弹一星和青蒿素体现团队积累及组织能力，中美接近和联合国代表权变化则改变国际处境。这些成就应独立说明，不被用作政治灾难的补偿分数。', ['sino-indian', 'third-front', 'tu-biography', 'rapprochement-frus']),
  ], ['anti-rightist', 'great-leap-famine', 'sino-soviet-split', 'sino-indian-war', 'science-third-front', 'cultural-revolution', 'rapprochement']),
  chapter('reopening', '文革后的平反、教育恢复和经济试验改善生活与预期，政治参与和生育自主仍受到严格边界约束。', [
    s('转折并非一夜完成', '1976年政治与灾害危机后，四人帮被捕，思想和组织纠错逐步展开。高考恢复、冤案改正及专业教育重新获得重视，华国锋、邓小平和其他领导的作用各异，基层和社会期待亦影响方向。', ['resolution-1981', 'reform-steps']),
    s('从家庭和地方改变经济', '家庭承包、价格调整、乡镇企业和特区逐步改变激励与开放条件。改革依靠试验及中央政治支持，也受到计划协调和财政约束。增长扩大就业和消费机会，同时使流动、区域差异和社会保障问题逐渐显现。', ['reform-development', 'poverty-report']),
    s('开放与控制并行', '法制重建及政治改革讨论与严打、思想运动并存，人口政策通过家庭和女性身体实施。中越战争说明经济转向没有使外部军事冲突消失。1989年抗议和镇压则暴露制度化讨论不能约束最高政治决定的限度。', ['birth-policy', 'vietnam-war', 'tiananmen-decision']),
  ], ['transition-1976', 'reform-opening', 'sino-vietnam-war', 'population-policy', 'constitution-law', 'tiananmen-1989']),
  chapter('integration', '1990年代市场改革和国际融入加速，增长的新机会与下岗、住房差异、政治压制和两岸不同制度路径并行。', [
    s('改革再启动', '南方谈话为市场化提供政治支持，财政金融和企业重组改变国家与地方、企业和家庭的关系。正式预算能力提高，地方发展竞赛和土地融资逐渐积累风险。市场化不是国家退出，而是国家以不同规则参与资源配置。', ['reform-steps', 'reform-development', 'stimulus-study']),
    s('转型成本由谁承担', '单位保障变化使部分工人下岗，住房商品化和人口流动创造资产及就业机会，也加大不平等。自主组织和宗教结社受限制，法轮功取缔体现国家对组织控制的边界。经济增长不能作为权利议题的替代答案。', ['reform-development', 'falungong-study']),
    s('港澳、台湾和世界', '香港澳门主权移交建立一国两制安排，权利及高度自治承诺需要后续检验。台湾解严、直选和政党轮替走向竞争政治，与大陆形成不同制度道路。加入WTO将中国更深地嵌入全球生产规则和市场。', ['hongkong-declaration', 'taiwan-elections', 'wto-accession']),
  ], ['southern-tour', 'market-restructuring', 'hongkong-macao', 'taiwan-democracy', 'falungong-1999', 'wto-2001']),
  chapter('growth', '二十一世纪初高速增长与国际能见度提高，公共卫生、环境、灾害和金融危机迫使发展模式接受新的检验。', [
    s('全球分工与劳动', '出口、城市建设和技术扩散推动生活改善，工人、农民工及家庭照护承担生产基础。基础设施和教育积累重要，WTO制度也降低部分外部障碍。贸易与GDP不能完整代表社会保障、工作安全及地区公平。', ['wto-anniversary', 'poverty-report']),
    s('能力与信息', 'SARS显示信息延误和医院感染风险，后期合作推动监测体系改善。汶川救援和社会志愿动员展示公共能力，也提出工程问责和受难者纪念问题。北京奥运提升国家形象，形象与居民实际体验仍应分别研究。', ['sars-who', 'wenchuan-response', 'beijing-opening']),
    s('投资模式的累积效应', '全球危机后的财政和信贷支持缓冲需求冲击，融资平台及房地产依赖却留下长期债务。后来风险不能全归于一次刺激，但它使地方财政、银行、土地和国企的联系更紧密。', ['stimulus-study', 'wb-2026']),
  ], ['wto-2001', 'sars-2003', 'earthquake-2008', 'olympics-2008', 'stimulus-2008']),
  chapter('contemporary', '2012年后的集中治理、全球竞争、数字与绿色转型及疫情，使增长、权利和安全之间的关系成为当代史核心。', [
    s('治理与权利', '反腐、机构改革和2018年修宪强化集中领导，香港和新疆安全政策引发重大权利争议。分析不能只重复政策目标，应检验拘禁、表达空间、程序和可问责性。公共讨论和独立证据的可得性本身影响研究能做到什么。', ['amendment-2018', 'xinjiang-ohchr', 'hongkong-un-experts']),
    s('发展与外部环境', '长期减贫、数字经济和新能源带来实质变化，一带一路及技术竞争又扩大国际联系和冲突。人口负增长、房地产调整和地方债要求新的分配与公共服务安排。新技术的可能性不能直接当作已经实现的普遍福利。', ['poverty-report', 'bri-economics', 'nbs-2025', 'wb-2026']),
    s('疫情与开放的结局', '防控在不同阶段取得控制效果并产生不同社会成本，退出时的医疗和数据问题仍需研究。两岸安全、全球气候与经济再平衡都在继续，2026年全年尚未结束。本文止于2026年10月10日资料范围，将统计、预测和未来目标分开，后来的历史需要新的证据。', ['who-china-2023', 'taiwan-inauguration', 'climate-ndc', 'wb-2026']),
  ], ['leadership-2012', 'belt-and-road', 'digital-society', 'hongkong-protests', 'xinjiang-rights', 'trade-tech-conflict', 'covid-19', 'poverty-alleviation', 'climate-transition', 'demographic-turn', 'taiwan-strait', 'china-2026']),
];

export const themes = [
  theme('sovereignty', '帝国、殖民与主权', '“中国”与主权的制度含义在帝国、条约、革命和国际组织中不断变化。', [
    s('主权不是没有时间的词', '清朝以多种制度治理不同地区，与现代民族国家的单一公民和边界体系并不完全相同。列强以战争和条约获得特权，领事裁判与租界使管辖权变得不平等。主权恢复是重要历史过程，也应考察地方居民和殖民社会的经验。', ['nanjing-treaty', 'wangxia', 'xinjiang-qing']),
    s('国家之间和居民之间', '1943年废约、联合国代表权及港澳移交是不同性质的制度变化。政府主张、国际承认、实际管辖和居民政治意愿不总重合。讨论台湾与边疆时需要标明材料主体，避免将任何一方解释直接写成所有人共同接受的事实。', ['cairo', 'un-2758', 'hongkong-declaration', 'taiwan-republic']),
  ], ['treaty-system', 'taiwan-colonial', 'wartime-alliance', 'rapprochement', 'hongkong-macao', 'taiwan-strait']),
  theme('institutions', '国家能力、法治与政治参与', '国家能够动员什么，与居民能够怎样限制和参与权力，是两个相连而不同的问题。', [
    s('从帝制到党国', '晚清新政、民初议会和南京党国分别尝试组织军队、税收和行政。形式制度可能缺少实际资源，强大组织又可能压制竞争政治。不能用有没有宪法一个问题判定所有治理质量。', ['qing-edict', 'sun-stages', 'chiang-newlife']),
    s('规则怎样约束权力', '1949年后的国家建设和政治运动增强控制，却破坏许多程序保障；1982年宪法重建规则，2018年变化又改变领导预期。台湾民主化显示社会抗争、统治集团选择与制度竞争可以共同推动转型，后续问责仍需要持续维护。', ['constitution', 'political-violence', 'amendment-2018', 'taiwan-elections']),
  ], ['constitutional-reform', 'republic-1912', 'nanjing-state', 'constitution-law', 'tiananmen-1989', 'taiwan-democracy', 'leadership-2012']),
  theme('land-rural', '土地、粮食与农村社会', '土地制度既关系生产和分配，也关系地方权力、身份与生存机会。', [
    s('分配并非只有产权', '租佃、债务、亲族和地方行政共同决定农民处境。土地改革使部分人获益，阶级划分及斗争又造成暴力；纲领的平等承诺必须与地方执行对照。战争动员与改革不能切开。', ['taiping-program', 'land-property', 'land-mao-liu']),
    s('粮食可得与制度反馈', '饥荒可能发生于仍有粮食生产甚至外运的地区，征购、购买力、迁移和信息决定谁能得到食物。家庭承包后来改善激励，城乡服务和土地权利问题仍持续。粮食总量不能代替家庭生存及营养指标。', ['famine-institutions', 'reform-development', 'poverty-report']),
  ], ['taiping', 'land-reform-civilwar', 'land-and-campaigns', 'great-leap-famine', 'reform-opening', 'poverty-alleviation']),
  theme('gender-family', '女性、家庭与身体自主', '国家变革进入家庭、劳动和生育，女性不是国家大事之外的补充人物。', [
    s('解放的不同目标', '教育、婚姻、劳动和政治参与的诉求并不相同。何殷震批评只为富强培养女性，秋瑾将自主与革命联系，战争中的女性又承担救护、生计和照护。少数杰出人物无法代表不同阶级、地区和年龄的全部经验。', ['hezhen', 'he-yin-study', 'vautrin-diary']),
    s('身体与公共政策', '生育政策的强制、战争性暴力及照护分配说明私人生活深受权力影响。发展指标和人口目标不能使侵权合理；生育放宽也需要就业、托育和尊重选择，不能只把女性当作增加劳动力的工具。', ['birth-policy-study', 'unfpa-programme', 'nbs-2025']),
  ], ['women-emancipation', 'nanjing-atrocities', 'wartime-society', 'population-policy', 'demographic-turn']),
  theme('education-science', '教育、知识与科研可信度', '学校、翻译与科研改变社会能力，开放批评和可检验方法决定知识能否可靠纠错。', [
    s('知识的制度载体', '世界知识编纂、废科举、新式大学和战时迁校重组人才路径。教育扩大机会又存在城乡、性别和阶级差异。科学不是单个天才的孤立成就，而依赖训练、设备、交流和失败能够被报告的环境。', ['yan-fu', 'hu-civilization', 'resistance-war']),
    s('成果与纠错空间', '国防项目和青蒿素显示组织积累的力量，政治迫害与教育中断又造成深远损失。AI时代同样需要区分有说服力的输出和可验证证据，数据偏差、复现、引用及责任不能交给技术速度自动解决。', ['tu-biography', 'cultural-revolution-impact', 'ai-rules']),
  ], ['education-reform', 'new-culture', 'wartime-society', 'science-third-front', 'transition-1976', 'digital-society']),
  theme('economy-labour', '经济增长、劳动与分配', '评价发展既看生产能力，也看收益和风险由谁承担。', [
    s('劳动者进入总量背后', '华工、工厂工人、农村劳动者和农民工支持战争、工业化及全球生产。增长可以改善生活，但职业安全、迁移权利、工资和照护不能由GDP推定。下岗和住房改革显示成本常集中落在特定家庭。', ['labour-corps', 'may30-study', 'reform-development']),
    s('发展路径与风险', '计划工业、市场改革和出口都依赖国家、地方及国际条件。刺激和基础设施可能缓冲危机，也积累债务；减贫与不平等是不同指标。专业比较需统一价格、地域与年份，不能把名义金额直接当作跨时期生活改善。', ['stimulus-study', 'poverty-report', 'wb-2026']),
  ], ['ww1-china', 'may-thirtieth', 'socialist-transformation', 'market-restructuring', 'wto-2001', 'stimulus-2008', 'china-2026']),
  theme('borderlands', '边疆、民族与地方视角', '边疆居民拥有不同身份和经验，不能只在中央扩张或国家危机叙述中出现。', [
    s('避免把群体当作单一行动者', '西北战争、新疆建省、日本统治下台湾及原住民族反抗涉及不同地方、宗教与利益。某支武装或领袖不能代表全部族群，国家分类也会改变身份和资源关系。战争造成的平民伤害必须分别归责。', ['xinjiang-qing', 'northwest-famine', 'wushe-documents']),
    s('安全与权利同时研究', '西藏协议和1959年冲突、新疆当代拘禁政策都需要标明资料主体。旧制度不平等、暴力袭击或外部干预可解释背景，不能取消居民宗教、文化、程序和人身权利。受限制的调查条件应公开说明。', ['tibet-agreement', 'tibet-coldwar', 'xinjiang-ohchr']),
  ], ['northwest-conflicts', 'xinjiang-crisis', 'taiwan-colonial', 'tibet-1951-1959', 'sino-indian-war', 'xinjiang-rights']),
  theme('disasters-environment', '灾害、环境与公共卫生', '灾害不是自然现象自动产生的固定后果，治理、信息和不平等决定风险如何分布。', [
    s('自然过程与政治选择', '旱灾、洪水和地震有自然机制，居民脆弱性却受交通、粮食、建设和资源分配影响。花园口洪灾更由战争决策直接制造，其后果延续多年。不能将人为因素隐藏于天灾名称，也不能以今天信息要求当时不存在的全部技术。', ['famine-1876', 'yellowriver-1938', 'wenchuan-response']),
    s('应急与长期恢复', 'SARS和新冠显示及时报告、专业知识和信任的重要性，紧急措施还需照护、比例与申诉保障。气候转型又将当代产业和未来风险连接，目标必须与实测区分。恢复不只建新房，也包括健康、家庭和生计。', ['sars-who', 'who-china-2023', 'climate-ndc']),
  ], ['north-china-famine', 'war-1938', 'great-leap-famine', 'sars-2003', 'earthquake-2008', 'covid-19', 'climate-transition']),
  theme('memory-evidence', '史料、记忆与责任', '客观不意味着对所有说法平均分配可信度，而是说明证据质量、来源立场和可推断范围。', [
    s('一手资料也有生成环境', '奏折、官方公报、日记、口供、外交电报和回忆录因目的不同而记录不同事实。受压迫者可能没有留下文字，档案也可能缺失或被限制。明确这些条件，才能避免把资料数量误当作全部社会经验。', ['nanjing-archive', 'rectification-study', 'tiananmen-documents']),
    s('承认分歧而不制造虚假对等', '南京暴行、饥荒和武力镇压存在充分事实证据，人数估计和局部过程的分歧不使否认同样可信。官方纠错、纪念和赔偿是历史行动，也不等于所有责任已查清。这里公开总目与增补范围，承认资料截点，而不宣称能够穷尽每个地方的每件事情。', ['famine-institutions', '228-truth', 'resolution-1981']),
  ], ['nanjing-atrocities', 'yanan-rectification', 'taiwan-228', 'great-leap-famine', 'tiananmen-1989', 'china-2026']),
];
