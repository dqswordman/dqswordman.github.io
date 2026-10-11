// Original explanatory diagrams. Nodes are conceptual categories, not measurements.
const figure = (titleZh, titleEn, noteZh, noteEn, labelsZh, labelsEn, edges, refs) => Object.fromEntries(['zh', 'en'].map((locale, i) => [locale, {
  title: i ? titleEn : titleZh,
  note: i ? noteEn : noteZh,
  nodes: (i ? labelsEn : labelsZh).map((lines, id) => ({ id: `n${id}`, lines })),
  edges: edges.map(([from, to]) => ({ from: `n${from}`, to: `n${to}` })),
  refs,
}]));

export const fullFigures = {
  'flood-1931': figure(
    '1931年洪灾：从水文冲击到生活危机', '1931: from hydrological shock to a livelihood crisis',
    '本站原创机制示意。箭头表示正文讨论的关联与作用路径，不表示实测流量、因果系数、地理位置或灾情轻重。救济环节旨在缓解后果；图中连线不意味着它造成损失。',
    'Original explanatory schematic. Arrows identify relationships discussed in the chapter, not measured flows, causal coefficients, geography or severity. Relief is an intervention intended to reduce harm, not an assertion that relief caused loss.',
    [['持续降水', '与前期水文条件'], ['河湖高水', '与排水受阻'], ['淹没、迁移', '与资产受损'], ['土地开发、暴露', '与堤防维护'], ['救济、运输', '与家庭取得'], ['疾病、饥饿', '及长期恢复']],
    [['Sustained rain', 'and prior conditions'], ['High river/lake water', 'and poor drainage'], ['Inundation, displacement', 'and lost assets'], ['Land use, exposure', 'and dyke maintenance'], ['Relief and transport', 'Household access'], ['Disease and hunger', 'Long-term recovery']],
    [[0, 1], [1, 2], [3, 2], [2, 5], [4, 5]], ['flood-1931', 'water-politics']),
  'flood-1954': figure(
    '1954年防洪：保护与风险转移', '1954: protection and redistribution of flood risk',
    '本站原创机制示意。城市防守、分洪和恢复分别需要评价；减少某地风险可伴随其他地区的损失。箭头不表示精确水量、地理方向或每次调度顺序，图中不作死亡数字比较。',
    'Original explanatory schematic. Urban defense, diversion and recovery require separate assessment. Protection in one place can accompany loss elsewhere. Arrows do not quantify water, indicate geography or reconstruct every operation; no mortality ranking is implied.',
    [['持续高水', '流域压力'], ['组织与工程', '堤防、物资、劳动'], ['城市保护', '与集中救济'], ['分洪与转移', '通知、撤离'], ['农村损失', '作物、住房、生计'], ['补偿与恢复', '健康、耕作、返回']],
    [['Sustained high water', 'Basin-wide pressure'], ['Organization/engineering', 'Defenses, supplies, labor'], ['Urban protection', 'Concentrated relief'], ['Diversion/evacuation', 'Warning and access'], ['Rural losses', 'Crops, homes, livelihoods'], ['Compensation/recovery', 'Health, farming, return']],
    [[0, 1], [1, 2], [0, 3], [3, 2], [3, 4], [4, 5]], ['yangzi-1954', 'water-politics']),
  'banqiao-1975': figure(
    '1975年水灾：工程、信息与下游风险', '1975: engineering, information and downstream risk',
    '本站原创安全链示意。自然冲击与工程、通信、撤离条件相互作用，箭头不为各因素分配责任百分比，也不替代水库调度记录或工程计算。不同水库的具体失效顺序须另查资料。',
    'Original safety-chain schematic. Natural shock interacts with engineering, communications and evacuation. Arrows assign no percentages of responsibility and do not replace operating records or engineering calculations. Individual reservoirs had their own failure sequences.',
    [['极端降水', '与快速入流'], ['库容、泄洪', '维护与调度'], ['溃坝与下游', '洪水传播'], ['通信与授权', '信息传递'], ['预警和避难', '撤离可达性'], ['救援及后果', '死亡、疾病、生计']],
    [['Extreme rain', 'and rapid inflow'], ['Storage and discharge', 'Maintenance/operation'], ['Failure and flooding', 'Downstream propagation'], ['Communication', 'and authorization'], ['Warning and shelter', 'Feasible evacuation'], ['Rescue/consequences', 'Deaths, health, livelihoods']],
    [[0, 1], [1, 2], [3, 1], [3, 4], [2, 5], [4, 5]], ['banqiao-safety', 'water-politics']),
  'tangshan-1976': figure(
    '唐山地震：从震动到长期重建', 'Tangshan: from shaking to long-term reconstruction',
    '本站原创城市灾害示意。震动、暴露和建筑条件共同影响损坏，救援与社会支持改变后续经历。图示为概念关系，不能据节点大小或距离推算损失，也不暗示短期地震预测已可保证成功。',
    'Original urban-disaster schematic. Shaking, exposure and buildings shape damage; rescue and support affect later experience. Node sizes and distances do not measure loss. The diagram does not imply that reliable short-term earthquake prediction was available.',
    [['地震震动', '时间与场地条件'], ['建筑与人口暴露', '夜间、结构、用途'], ['人员及系统损坏', '住房、水电、交通'], ['准备与救援', '自救、组织、医疗'], ['照护与安置', '伤残、失亲、住房'], ['长期重建', '就业、社区、记忆']],
    [['Earthquake shaking', 'Timing and site conditions'], ['Buildings/exposure', 'Night, structure, use'], ['People and systems', 'Housing, utilities, access'], ['Preparation and rescue', 'Neighbors, teams, medicine'], ['Care and resettlement', 'Disability, loss, shelter'], ['Long-term rebuilding', 'Work, community, memory']],
    [[0, 1], [1, 2], [2, 5], [3, 4], [4, 5], [3, 2]], ['tangshan-usgs', 'tangshan-social']),
};
