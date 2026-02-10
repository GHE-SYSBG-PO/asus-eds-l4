/**
 * 获取桌面比例
 * @param {*} scale 比例参数
 * @returns 返回col1和col2的类名
 */
const handlDColSpan = (scale) => {
  let colClass1 = '';
  let colClass2 = '';
  switch (scale) {
    case '3:9':
      colClass1 = 'lg:col-[1/4]';
      colClass2 = 'lg:col-[4/13]';
      break;
    case '4:8':
      colClass1 = 'lg:col-[1/5]';
      colClass2 = 'lg:col-[5/13]';
      break;
    case '5:7':
      colClass1 = 'lg:col-[1/6]';
      colClass2 = 'lg:col-[6/13]';
      break;
    case '6:6':
      colClass1 = 'lg:col-[1/7]';
      colClass2 = 'lg:col-[7/13]';
      break;
    case '7:5':
      colClass1 = 'lg:col-[1/8]';
      colClass2 = 'lg:col-[8/13]';
      break;
    case '8:4':
      colClass1 = 'lg:col-[1/9]';
      colClass2 = 'lg:col-[9/13]';
      break;
    case '9:3':
      colClass1 = 'lg:col-[1/10]';
      colClass2 = 'lg:col-[10/13]';
      break;
    case '7:6':
      colClass1 = 'lg:col-[1/8]';
      colClass2 = 'lg:col-[7/13]';
      break;
    case '8:6':
      colClass1 = 'lg:col-[1/9]';
      colClass2 = 'lg:col-[8/13]';
      break;
    case '9:6':
      colClass1 = 'lg:col-[1/10]';
      colClass2 = 'lg:col-[7/13]';
      break;
    case '100vw:6':
      colClass1 = 'lg:col-[1/13]';
      colClass2 = 'lg:col-[1/7]';
      break;
    case '6:7':
      colClass1 = 'lg:col-[1/7]';
      colClass2 = 'lg:col-[6/13]';
      break;
    case '6:8':
      colClass1 = 'lg:col-[1/7]';
      colClass2 = 'lg:col-[5/13]';
      break;
    case '6:9':
      colClass1 = 'lg:col-[1/7]';
      colClass2 = 'lg:col-[4/13]';
      break;
    case '6:100vw':
      colClass1 = 'lg:col-[1/7]';
      colClass2 = 'lg:col-[1/13]';
      break;
    case '8:5':
      colClass1 = 'lg:col-[1/9]';
      colClass2 = 'lg:col-[8/13]';
      break;
    case '9:5':
      colClass1 = 'lg:col-[1/10]';
      colClass2 = 'lg:col-[8/13]';
      break;
    case '10:5':
      colClass1 = 'lg:col-[1/11]';
      colClass2 = 'lg:col-[8/13]';
      break;
    case '100vw:5':
      colClass1 = 'lg:col-[1/13]';
      colClass2 = 'lg:col-[8/13]';
      break;
    case '5:8':
      colClass1 = 'lg:col-[1/6]';
      colClass2 = 'lg:col-[5/13]';
      break;
    case '5:9':
      colClass1 = 'lg:col-[1/6]';
      colClass2 = 'lg:col-[4/13]';
      break;
    case '5:10':
      colClass1 = 'lg:col-[1/6]';
      colClass2 = 'lg:col-[3/13]';
      break;
    case '5:100vw':
      colClass1 = 'lg:col-[1/6]';
      colClass2 = 'lg:col-[1/13]';
      break;
    case '9:4':
      colClass1 = 'lg:col-[1/10]';
      colClass2 = 'lg:col-[9/13]';
      break;
    case '10:4':
      colClass1 = 'lg:col-[1/11]';
      colClass2 = 'lg:col-[9/13]';
      break;
    case '11:4':
      colClass1 = 'lg:col-[1/12]';
      colClass2 = 'lg:col-[9/13]';
      break;
    case '100vw:4':
      colClass1 = 'lg:col-[1/13]';
      colClass2 = 'lg:col-[9/13]';
      break;
    case '4:9':
      colClass1 = 'lg:col-[1/5]';
      colClass2 = 'lg:col-[4/13]';
      break;
    case '4:10':
      colClass1 = 'lg:col-[1/5]';
      colClass2 = 'lg:col-[3/13]';
      break;
    case '4:11':
      colClass1 = 'lg:col-[1/5]';
      colClass2 = 'lg:col-[2/13]';
      break;
    case '4:100vw':
      colClass1 = 'lg:col-[1/5]';
      colClass2 = 'lg:col-[1/13]';
      break;
    case '100vw:12':
      colClass1 = 'lg:col-[1/13]';
      colClass2 = 'lg:col-[1/13]';
      break;
    default:
      // 默认情况下不添加特殊类名或添加默认样式
      break;
  }
  return { colClass1, colClass2 };
};

/**
 * 获取平板比例
 * @param {*} scale 比例参数
 * @returns 返回col1和col2的类名
 */
const handlTColSpan = (scale) => {
  let colClass1 = '';
  let colClass2 = '';
  switch (scale) {
    case '5:7':
      colClass1 = 'md:col-[1/6]';
      colClass2 = 'md:col-[6/13]';
      break;
    case '6:6':
      colClass1 = 'md:col-[1/7]';
      colClass2 = 'md:col-[7/13]';
      break;
    case '7:5':
      colClass1 = 'md:col-[1/8]';
      colClass2 = 'md:col-[8/13]';
      break;
    case '7:6':
      colClass1 = 'md:col-[1/8]';
      colClass2 = 'md:col-[6/13]';
      break;
    case '8:6':
      colClass1 = 'md:col-[1/9]';
      colClass2 = 'md:col-[5/13]';
      break;
    case '9:6':
      colClass1 = 'md:col-[1/10]';
      colClass2 = 'md:col-[4/13]';
      break;
    case '100vw:6':
      colClass1 = 'md:col-[1/13]';
      colClass2 = 'md:col-[7/13]';
      break;
    case '6:7':
      colClass1 = 'md:col-[1/7]';
      colClass2 = 'md:col-[6/13]';
      break;
    case '6:8':
      colClass1 = 'md:col-[1/7]';
      colClass2 = 'md:col-[5/13]';
      break;
    case '6:9':
      colClass1 = 'md:col-[1/7]';
      colClass2 = 'md:col-[4/13]';
      break;
    case '6:100vw':
      colClass1 = 'md:col-[1/7]';
      colClass2 = 'md:col-[1/13]';
      break;
    case '8:5':
      colClass1 = 'md:col-[1/9]';
      colClass2 = 'md:col-[8/13]';
      break;
    case '9:5':
      colClass1 = 'md:col-[1/10]';
      colClass2 = 'md:col-[8/13]';
      break;
    case '10:5':
      colClass1 = 'md:col-[1/11]';
      colClass2 = 'md:col-[8/13]';
      break;
    case '100vw:5':
      colClass1 = 'md:col-[1/13]';
      colClass2 = 'md:col-[1/6]';
      break;
    case '5:8':
      colClass1 = 'md:col-[1/6]';
      colClass2 = 'md:col-[5/13]';
      break;
    case '5:9':
      colClass1 = 'md:col-[1/6]';
      colClass2 = 'md:col-[4/13]';
      break;
    case '5:10':
      colClass1 = 'md:col-[1/6]';
      colClass2 = 'md:col-[3/13]';
      break;
    case '5:100vw':
      colClass1 = 'md:col-[1/6]';
      colClass2 = 'md:col-[1/13]';
      break;
    case '100vw:12':
      colClass1 = 'md:col-[1/13]';
      colClass2 = 'md:col-[1/13]';
      break;
    default:
      // 默认情况下不添加特殊类名或添加默认样式
      break;
  }
  return { colClass1, colClass2 };
};

export default function decorate(block) {
  // console.log('执行columns-section', block);
  if (!block.children || block.children.length < 2) return;
  const [col1, col2] = [...block.children];
  col1.classList.add('md:row-1', 'lg:row-1', 'md:order-1', 'md:z-1');
  col2.classList.add('md:row-1', 'lg:row-1', 'md:order-2');

  const config = block.dataset;
  // 默认值
  const dlayoutvariation = config.dlayoutvariation || '1';
  const tlayoutvariation = config.tlayoutvariation || '1';
  const mlayoutvariation = config.mlayoutvariation || '1';
  const mreverse = config.mreverse || 'no';
  config.tabletstackon = config.tabletstackon || 'no';
  config.dcolspan1 = config.dcolspan1 || '3:9';
  config.dcolspan2 = config.dcolspan2 || '7:6';
  config.dcolspan3 = config.dcolspan3 || '8:5';
  config.dcolspan4 = config.dcolspan4 || '9:4';
  config.dcolspan5 = config.dcolspan4 || '100vw:12';
  config.tcolspan1 = config.tcolspan1 || '5:7';
  config.tcolspan2 = config.tcolspan2 || '7:6';
  config.tcolspan3 = config.tcolspan3 || '8:5';
  config.tcolspan4 = config.tcolspan4 || '100vw:12';

  // 默认类名
  col1.classList.add('w-full', 'h-full');
  col2.classList.add('w-full', 'h-full');

  if (dlayoutvariation) {
    const dcolspan = config[`dcolspan${dlayoutvariation}`];
    if (dcolspan) {
      const { colClass1, colClass2 } = handlDColSpan(dcolspan);
      col1.classList.add(colClass1);
      col2.classList.add(colClass2);
    }
  }

  if (config.tabletstackon === 'yes') {
    col1.classList.add('md:col-[1/13]', 'md:row-[1/2');
    col2.classList.add('md:col-[1/13]', 'md:row-[2/3]');
  } else if (tlayoutvariation) {
    const tcolspan = config[`tcolspan${tlayoutvariation}`];
    if (tcolspan) {
      const { colClass1, colClass2 } = handlTColSpan(tcolspan);
      col1.classList.add(colClass1);
      col2.classList.add(colClass2);
    }
  }

  if (mlayoutvariation) {
    switch (mlayoutvariation) {
      case '1':
        col1.classList.add('col-[1/13]');
        col2.classList.add('col-[1/13]');
        break;
      case '2':
        col1.classList.add('col-[1/13]', 'row-1');
        col2.classList.add('col-[1/13]', 'row-1');
        break;
      default:
        // 默认情况下不添加特殊类名或添加默认样式
        break;
    }
  }

  if (mreverse === 'yes') {
    col1.classList.add('col-[1/13]', 'order-2');
    col2.classList.add('col-[1/13]', 'order-1');
  }
  block.classList.add('grid', 'grid-cols-12');
  block.append(col1, col2);
}
