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
    '本站原创概念图。持续降雨、土地开发和堤防维护共同塑造灾害；淹没与迁移损伤家庭生计，救济和运输支持疾病防治与生活恢复。箭头概括本章叙述的关联。',
    'Original conceptual diagram. Rainfall, land use and dyke maintenance shaped the disaster. Flooding and displacement damaged household livelihoods; relief and transport supported health and recovery. Arrows summarize the relationships described in the chapter.',
    [['持续降水', '与前期水文条件'], ['河湖高水', '与排水受阻'], ['淹没、迁移', '与资产受损'], ['土地开发、暴露', '与堤防维护'], ['救济、运输', '与家庭取得'], ['疾病、饥饿', '及长期恢复']],
    [['Sustained rain', 'and prior conditions'], ['High river/lake water', 'and poor drainage'], ['Inundation, displacement', 'and lost assets'], ['Land use, exposure', 'and dyke maintenance'], ['Relief and transport', 'Household access'], ['Disease and hunger', 'Long-term recovery']],
    [[0, 1], [1, 2], [3, 2], [2, 5], [4, 5]], ['flood-1931', 'water-politics']),
  'flood-1954': figure(
    '1954年防洪：保护与风险转移', '1954: protection and redistribution of flood risk',
    '本站原创概念图。堤防、动员和救济保护城市，分洪同时把灾害带入承担蓄洪的乡村。住房、作物和健康损失延续到退水以后，补偿与恢复成为防洪历史的一部分。',
    'Original conceptual diagram. Defenses, mobilization and relief protected cities while flood diversion exposed rural communities to loss. Damage to homes, crops and health continued after the waters receded, making compensation and recovery part of the history of flood control.',
    [['持续高水', '流域压力'], ['组织与工程', '堤防、物资、劳动'], ['城市保护', '与集中救济'], ['分洪与转移', '通知、撤离'], ['农村损失', '作物、住房、生计'], ['补偿与恢复', '健康、耕作、返回']],
    [['Sustained high water', 'Basin-wide pressure'], ['Organization/engineering', 'Defenses, supplies, labor'], ['Urban protection', 'Concentrated relief'], ['Diversion/evacuation', 'Warning and access'], ['Rural losses', 'Crops, homes, livelihoods'], ['Compensation/recovery', 'Health, farming, return']],
    [[0, 1], [1, 2], [0, 3], [3, 2], [3, 4], [4, 5]], ['yangzi-1954', 'water-politics']),
  'banqiao-1975': figure(
    '1975年水灾：工程、信息与下游风险', '1975: engineering, information and downstream risk',
    '本站原创概念图。极端降雨冲击库容与泄洪能力，通信和授权影响调度与预警。下游居民的撤离条件、救援速度和生活恢复，将工程决策与灾难中的个人命运联系起来。',
    'Original conceptual diagram. Extreme rain overwhelmed storage and discharge capacity while communications and authorization shaped operations and warnings. Evacuation, rescue and recovery connected engineering decisions to the lives of downstream residents.',
    [['极端降水', '与快速入流'], ['库容、泄洪', '维护与调度'], ['溃坝与下游', '洪水传播'], ['通信与授权', '信息传递'], ['预警和避难', '撤离可达性'], ['救援及后果', '死亡、疾病、生计']],
    [['Extreme rain', 'and rapid inflow'], ['Storage and discharge', 'Maintenance/operation'], ['Failure and flooding', 'Downstream propagation'], ['Communication', 'and authorization'], ['Warning and shelter', 'Feasible evacuation'], ['Rescue/consequences', 'Deaths, health, livelihoods']],
    [[0, 1], [1, 2], [3, 1], [3, 4], [2, 5], [4, 5]], ['banqiao-safety', 'water-politics']),
  'tangshan-1976': figure(
    '唐山地震：从震动到长期重建', 'Tangshan: from shaking to long-term reconstruction',
    '本站原创概念图。夜间地震、人口分布与建筑结构共同塑造伤亡和城市损坏。邻里自救、医疗与安置接续展开，伤残照护、住房和就业推动了长期重建。',
    'Original conceptual diagram. Nighttime shaking, population exposure and building structures shaped casualties and urban destruction. Rescue by neighbors, medical care and resettlement followed; disability support, housing and employment shaped long-term reconstruction.',
    [['地震震动', '时间与场地条件'], ['建筑与人口暴露', '夜间、结构、用途'], ['人员及系统损坏', '住房、水电、交通'], ['准备与救援', '自救、组织、医疗'], ['照护与安置', '伤残、失亲、住房'], ['长期重建', '就业、社区、记忆']],
    [['Earthquake shaking', 'Timing and site conditions'], ['Buildings/exposure', 'Night, structure, use'], ['People and systems', 'Housing, utilities, access'], ['Preparation and rescue', 'Neighbors, teams, medicine'], ['Care and resettlement', 'Disability, loss, shelter'], ['Long-term rebuilding', 'Work, community, memory']],
    [[0, 1], [1, 2], [2, 5], [3, 4], [4, 5], [3, 2]], ['tangshan-usgs', 'tangshan-social']),
};
