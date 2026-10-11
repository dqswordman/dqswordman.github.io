import { biography as b, actor as a } from './schema.mjs';

export const internationalSources = [
  ['hirohito-authority', '昭和天皇, 1901–1989', 'National Diet Library, Japan', '人物规范记录', 'https://id.ndl.go.jp/auth/ndlna/00083479', '核对姓名及生卒年；规范记录不提供独立战争责任评估。'],
  ['tojo-authority', '東条英機, 1884–1948', 'National Diet Library, Japan', '人物规范记录', 'https://id.ndl.go.jp/auth/ndlna/00085935', '姓名及生卒年；战争行动及审判须另读档案。'],
  ['matsui-authority', '松井石根, 1878–1948', 'National Diet Library, Japan', '人物规范记录', 'https://id.ndl.go.jp/auth/ndlna/00149300', '姓名及生卒年；不以规范条目代替指挥责任研究。'],
  ['ishii-authority', '石井四郎, 1892–1959', 'National Diet Library, Japan', '人物规范记录', 'https://id.ndl.go.jp/auth/ndlna/01009459', '生卒年及731部队职务；罪行与战后处理另引NARA研究。'],
  ['chennault-biography', 'Major General Claire Lee Chennault', 'United States Air Force', '机构传记', 'https://www.af.mil/About-Us/Biographies/Display/Article/107526/major-general-claire-lee-chennault/', '美军传记采用1890年生；部分馆藏目录采用1893年，本站明确保留差异。'],
  ['chennault-papers', 'Chennault Family Papers: Collection Guide', 'Louisiana State University Libraries', '档案目录', 'https://lib.lsu.edu/sites/default/files/sc/findaid/3042.pdf', '馆藏目录采用1893年生，与美军传记1890年不同；不自行抹平。'],
  ['fdr-biography', 'FDR Biography', 'Franklin D. Roosevelt Presidential Library', '机构传记', 'https://www.fdrlibrary.org/fdr-biography', '用于生平与任职；对华战略另读外交及军方文件。'],
  ['stalin-authority', 'Stalin, Joseph, 1878–1953', 'Library of Congress', '人物规范记录', 'https://lccn.loc.gov/n80044789', '采用1878年出生，记录亦注明苏联官方曾使用1879年；相关政策另据档案研究。'],
].map(([id, title, publisher, type, url, note]) => ({ id, title, publisher, type, url, note }));

export const internationalPeople = [
  b('hirohito', '裕仁（昭和天皇）', 1901, 1989, '日本天皇', '战争时期日本国家与军制的核心象征及实际决策参与者，战后未被起诉。', '裕仁在帝国军政制度内接受教育并于1926年即位，天皇拥有宪制与统帅地位，实际政策通过多种军政渠道运作。', '其在侵华和太平洋战争中的知情、批准及干预范围，是研究责任的重要问题；1945年参与投降决策，战后天皇制度被保留。', '不能以未受审证明没有历史责任，也不能把所有部队每项行为未经证据直接视为其个人命令。须区分制度权威、具体知情和行动。', ['hirohito-authority', 'nara-japan', 'potsdam']),
  b('hideki-tojo', '东条英机', 1884, 1948, '日本陆军将领、战时首相', '在侵略战争和战时国家决策中负重要责任，战后被判刑并处决。', '东条从陆军体系升至军政核心，其权力与日本军事扩张和军部政治相联系。', '1941—1944年任首相并兼任重要军事职务，参与扩大太平洋战争及对华战争政策，1948年经东京审判后被处决。', '个人责任须根据具体任期、政策与指挥证据，不能以他承担责任替其他领导者和制度免责。', ['tojo-authority', 'nara-japan']),
  b('iwane-matsui', '松井石根', 1878, 1948, '日军华中战区高级指挥官', '南京攻占期间的高级指挥者，战后因未制止暴行的指挥责任被定罪。', '松井具有长期对华军事经历，在1937年战争扩大时担任华中方面高级指挥。', '其部队攻占南京，随后发生大规模暴行；东京审判追究其知情与制止责任，1948年被处决。', '区分命令实施和有能力却未制止的指挥责任，不把个人判决当作全部参与部队和国家责任已被穷尽。', ['matsui-authority', 'nara-japan', 'nanjing-archive']),
  b('shiro-ishii', '石井四郎', 1892, 1959, '日本军医生物战组织负责人', '参与建立731部队体系，致命人体实验与战后责任规避须明确记录。', '石井受医学训练，在日本军方组织和资源支持下发展生物战研究。', '其体系对被拘禁者实施致命实验；战后美方重视获取数据，相关安排使其未受充分追诉。', '医学身份不使未经同意的实验合法。每项具体攻击仍须核证，不以未受审或档案缺漏否认已证实罪行。', ['ishii-authority', 'nara-731', 'nara-japan']),
  b('joseph-stilwell', '约瑟夫·史迪威', 1883, 1946, '美军将领、援华及中缅印战区指挥者', '整训、缅甸作战及对援助指挥权的要求，使其成为盟国合作与分歧的关键人物。', '史迪威有长期在华语言及军事观察经验，二战期间承担多重军事和联络任务。', '组织对华军事合作和缅甸方向作战，与蒋介石、陈纳德及英方在战略和资源上分歧，1944年被召回。', '不能把分歧全部解释为个人脾气；指挥权、主权及美中目标差异更重要，美军战史亦有机构立场。', ['army-stilwell-mission', 'army-stilwell-command']),
  b('claire-chennault', '克莱尔·陈纳德', 1890, 1958, '美军航空将领、飞虎队领导者', '推动援华航空作战并重视空军战略，与地面作战优先方案存在分歧。', '陈纳德具有航空训练和战术经验，1930年代赴华协助航空建设；美军传记采用1890年出生，部分馆藏采用1893年。', '领导美国志愿航空队并担任第十四航空队指挥，支持以空中打击日本交通与军事目标，战后继续参与对华航空事业。', '航空贡献需与后勤、基地及中国人员劳动一起理解，不能将飞虎队故事代表全部抗战。生年差异明确保留。', ['chennault-biography', 'chennault-papers', 'army-stilwell-command']),
  b('franklin-roosevelt', '富兰克林·罗斯福', 1882, 1945, '美国总统', '通过援助、战争协调与开罗会议参与中国战时及战后国际位置的塑造。', '罗斯福在大萧条与欧洲、亚洲战争扩展中领导美国，国内政治和全球战略影响对华政策。', '推动援华、对日作战及盟国会议，将中国纳入战后国际秩序规划，也在全球资源配置中设定优先次序。', '支持中国与追求美国战略利益并存，不能把援助描述为无条件慈善或唯一胜利原因。', ['fdr-biography', 'cairo', 'army-stilwell-command']),
  b('joseph-stalin', '约瑟夫·斯大林', 1878, 1953, '苏联领导人', '苏联援华、对日参战、中苏结盟与朝鲜战争的重要决策者。', '斯大林掌握高度集中的苏联党政权力；采用1878年出生，苏联官方纪念口径曾为1879年。', '对华政策随苏联安全、对日及全球战争变化，1945年对日参战，1950年同中华人民共和国结盟，并影响朝鲜战争的决策环境。', '援助、战略利益及对华不平等要求需一起考察，不能把共产主义联盟等同于没有国家利益冲突。', ['stalin-authority', 'sino-soviet', 'korea-history']),
];
internationalPeople.find(p => p.id === 'claire-chennault').dates = '1890（部分资料1893）—1958';

export const internationalEnglishPeople = [
  ['hirohito', 'Hirohito (Emperor Shōwa)', 'Emperor of Japan', 'Hirohito occupied the constitutional and military apex of the imperial system from 1926.', 'His knowledge, approvals and interventions during aggression and war remain central questions; he participated in surrender and was not prosecuted afterward.', 'Non-prosecution does not establish absence of historical responsibility. Institutional authority, specific knowledge and individual orders must be distinguished.'],
  ['hideki-tojo', 'Tōjō Hideki', 'Japanese general and wartime prime minister', 'Tōjō rose through the army into the center of military government.', 'As prime minister in 1941–1944 he helped direct the Pacific and China wars. He was convicted at Tokyo and executed in 1948.', 'His responsibility does not absorb that of other leaders, institutions or perpetrators. Particular policies require dates and evidence.'],
  ['iwane-matsui', 'Matsui Iwane', 'Senior Japanese commander in central China', 'Matsui had extensive military experience concerning China and held senior command in 1937.', 'His forces occupied Nanjing. The Tokyo tribunal held him responsible for failing to prevent atrocities; he was executed in 1948.', 'Command responsibility differs from proof that he personally ordered every act. His conviction did not exhaust the responsibilities of all forces and leaders.'],
  ['shiro-ishii', 'Ishii Shirō', 'Military physician and biological-warfare organizer', 'Ishii used military resources and medical training to develop biological-warfare institutions.', 'His system conducted lethal experiments on detainees. American interest in data contributed to arrangements that prevented full prosecution.', 'Medical purpose cannot justify non-consensual experimentation. Individual operational claims still require verification.'],
  ['joseph-stilwell', 'Joseph W. Stilwell', 'US general in the China–Burma–India theater', 'Stilwell brought language experience and military observation in China to multiple wartime roles.', 'He organized training and Burma operations and disputed strategy and authority with Chiang, Chennault and British partners before recall in 1944.', 'Conflicts concerned sovereignty, allocation and incompatible objectives as well as personality. Official military histories retain institutional perspectives.'],
  ['claire-chennault', 'Claire L. Chennault', 'US aviation commander and Flying Tigers leader', 'Chennault developed fighter tactics and helped Chinese aviation. US Air Force biography gives 1890 as his birth year; some archival guides give 1893.', 'He led the American Volunteer Group and Fourteenth Air Force and advocated air attacks on Japanese transport and positions.', 'Air achievements depended on Chinese personnel, bases and transport. The birth-year discrepancy remains explicit.'],
  ['franklin-roosevelt', 'Franklin D. Roosevelt', 'US president', 'Roosevelt led the United States through depression and expanding global war.', 'He supported assistance to China, Allied coordination and the Cairo meeting while allocating resources within global priorities.', 'Support for China and American strategic interests coexisted. Aid was neither unconditional charity nor the sole explanation of victory.'],
  ['joseph-stalin', 'Joseph Stalin', 'Soviet leader', 'Stalin controlled a highly centralized state. The biography uses 1878; Soviet official commemorations used 1879.', 'His decisions shaped assistance, Soviet entry against Japan, the 1950 alliance and the Korean War’s strategic setting.', 'Shared ideology did not eliminate national interests, unequal power or disagreement. Specific decisions require archival context.'],
].map(([id, name, role, background, activity, assessment]) => ({ id, name, role, background, activity, assessment }));

export const internationalActors = {
  'full-scale-war': [a('hirohito', '维持帝国战争政策及军制权威。', '通过军政决策渠道参与战争时期的批准与知情。', '侵略扩大；具体指挥链仍须逐项核证。', ['nara-japan'])],
  'nanjing-atrocities': [a('iwane-matsui', '以高级指挥身份推进占领。', '指挥攻占南京的战区力量，未有效阻止暴行。', '战后被追究指挥责任并处决。', ['nara-japan'])],
  'wang-regime': [a('hideki-tojo', '以战争及从属政权维持日本支配。', '在首相任期内继续对华战争和占领政策。', '合作政权未获对等主权；其后被判战争罪。', ['nara-japan'])],
  'wartime-alliance': [a('joseph-stilwell', '重视整训及缅甸陆路战略。', '协调援助、训练与作战。', '取得成果，也因指挥权分歧被召回。', ['army-stilwell-command']), a('claire-chennault', '主张航空打击及援华。', '组织志愿队和第十四航空队。', '扩大航空作用，后勤优先权仍有争论。', ['chennault-biography', 'army-stilwell-command']), a('franklin-roosevelt', '支持中国抵抗并追求盟国全球战略。', '推动援助、战争协调和开罗会议。', '中国国际位置提升，援助始终受全球资源限制。', ['fdr-biography', 'cairo'])],
  'war-end-1945': [a('hirohito', '在败局中接受结束战争。', '参与接受投降条件并公开宣布。', '日本投降；天皇制度保留，未被起诉。', ['potsdam', 'nara-japan']), a('joseph-stalin', '扩大苏联远东战略利益并击败日本。', '决定对日参战、进军东北。', '促成日本败局，也改变战后东北力量结构。', ['potsdam', 'sino-soviet']), a('shiro-ishii', '战后寻求避免追责。', '其研究资料成为美方调查及交换对象。', '未受充分起诉，受害者正义严重受损。', ['nara-731', 'nara-japan'])],
  'korean-war': [a('joseph-stalin', '支持盟友并控制直接卷入风险。', '影响朝鲜战争战略和对华协调。', '战争扩大；中苏利益与风险承担并不相等。', ['sino-soviet', 'korea-history'])],
};
export const internationalEnglishActors = {
  'full-scale-war/hirohito': ['Preserve imperial military authority.', 'Participated through wartime approval and information channels.', 'Aggression expanded; individual command claims require evidence.'],
  'nanjing-atrocities/iwane-matsui': ['Advance occupation as senior commander.', 'Commanded the theater and failed to restrain atrocities.', 'Convicted for command responsibility and executed.'],
  'wang-regime/hideki-tojo': ['Maintain Japanese dominance.', 'Continued war and occupation during his premiership.', 'Subordinate rule persisted; later convicted.'],
  'wartime-alliance/joseph-stilwell': ['Prioritize training and the Burma land route.', 'Coordinated aid, training and operations.', 'Operational gains coexisted with command disputes and recall.'],
  'wartime-alliance/claire-chennault': ['Prioritize aviation support and attacks.', 'Led volunteer and Fourteenth Air Force operations.', 'Air capacity expanded amid allocation disputes.'],
  'wartime-alliance/franklin-roosevelt': ['Support China within global Allied strategy.', 'Advanced aid and conference diplomacy.', 'International standing improved under resource constraints.'],
  'war-end-1945/hirohito': ['Accept termination of the war.', 'Participated in surrender and its announcement.', 'Surrender followed; imperial institution retained.'],
  'war-end-1945/joseph-stalin': ['Defeat Japan and expand Soviet strategic influence.', 'Ordered entry into the war and northeastern advance.', 'Affected surrender and the postwar regional balance.'],
  'war-end-1945/shiro-ishii': ['Avoid postwar prosecution.', 'His research became an object of American investigation and exchange.', 'Full accountability was obstructed.'],
  'korean-war/joseph-stalin': ['Support allies while limiting direct Soviet exposure.', 'Shaped strategic coordination.', 'War expanded with unequal allocation of risks.'],
};
