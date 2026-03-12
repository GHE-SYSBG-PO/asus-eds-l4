import buildSecitonClass from '../../components/section/section.js';

/**
 * Get desktop column proportions
 * @param {*} scale Proportion parameter
 * @returns Returns class names for col1 and col2
 */
const handlDColSpan = (scale) => {
  let colClass1 = '';
  let colClass2 = '';
  switch (scale) {
    case '3:9':
      colClass1 = 'lg:col-[1/4] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[4/13] lg:w-[auto] lg:ml-0';
      break;
    case '4:8':
      colClass1 = 'lg:col-[1/5] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[5/13] lg:w-[auto] lg:ml-0';
      break;
    case '5:7':
      colClass1 = 'lg:col-[1/6] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[6/13]';
      break;
    case '6:6':
      colClass1 = 'lg:col-[1/7] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[7/13] lg:w-[auto] lg:ml-0';
      break;
    case '7:5':
      colClass1 = 'lg:col-[1/8] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[8/13] lg:w-[auto] lg:ml-0';
      break;
    case '8:4':
      colClass1 = 'lg:col-[1/9] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[9/13] lg:w-[auto] lg:ml-0';
      break;
    case '9:3':
      colClass1 = 'lg:col-[1/10] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[10/13] lg:w-[auto] lg:ml-0';
      break;
    case '7:6':
      colClass1 = 'lg:col-[1/8] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[7/13] lg:w-[auto] lg:ml-0';
      break;
    case '8:6':
      colClass1 = 'lg:col-[1/9] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[8/13] lg:w-[auto] lg:ml-0';
      break;
    case '9:6':
      colClass1 = 'lg:col-[1/10] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[7/13] lg:w-[auto] lg:ml-0';
      break;
    case '100vw:6':
      colClass1 = 'lg:col-[1/13] lg:w-[100vw] lg:ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
      colClass2 = 'lg:col-[1/7] lg:w-[auto] lg:ml-0';
      break;
    case '6:7':
      colClass1 = 'lg:col-[1/7] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[6/13] lg:w-[auto] lg:ml-0';
      break;
    case '6:8':
      colClass1 = 'lg:col-[1/7] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[5/13] lg:w-[auto] lg:ml-0';
      break;
    case '6:9':
      colClass1 = 'lg:col-[1/7] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[4/13] lg:w-[auto] lg:ml-0';
      break;
    case '6:100vw':
      colClass1 = 'lg:col-[1/7] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[1/13] lg:w-[100vw] lg:ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
      break;
    case '8:5':
      colClass1 = 'lg:col-[1/9] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[8/13] lg:w-[auto] lg:ml-0';
      break;
    case '9:5':
      colClass1 = 'lg:col-[1/10] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[8/13] lg:w-[auto] lg:ml-0';
      break;
    case '10:5':
      colClass1 = 'lg:col-[1/11] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[8/13] lg:w-[auto] lg:ml-0';
      break;
    case '100vw:5':
      colClass1 = 'lg:col-[1/13] lg:w-[100vw] lg:ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
      colClass2 = 'lg:col-[8/13] lg:w-[auto] lg:ml-0';
      break;
    case '5:8':
      colClass1 = 'lg:col-[1/6] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[5/13] lg:w-[auto] lg:ml-0';
      break;
    case '5:9':
      colClass1 = 'lg:col-[1/6] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[4/13] lg:w-[auto] lg:ml-0';
      break;
    case '5:10':
      colClass1 = 'lg:col-[1/6] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[3/13] lg:w-[auto] lg:ml-0';
      break;
    case '5:100vw':
      colClass1 = 'lg:col-[1/6] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[1/13] lg:w-[100vw] lg:ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
      break;
    case '9:4':
      colClass1 = 'lg:col-[1/10] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[9/13] lg:w-[auto] lg:ml-0';
      break;
    case '10:4':
      colClass1 = 'lg:col-[1/11] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[9/13] lg:w-[auto] lg:ml-0';
      break;
    case '11:4':
      colClass1 = 'lg:col-[1/12] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[9/13] lg:w-[auto] lg:ml-0';
      break;
    case '100vw:4':
      colClass1 = 'lg:col-[1/13] lg:w-[100vw] lg:ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
      colClass2 = 'lg:col-[9/13] lg:w-[auto] lg:ml-0';
      break;
    case '4:9':
      colClass1 = 'lg:col-[1/5] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[4/13] lg:w-[auto] lg:ml-0';
      break;
    case '4:10':
      colClass1 = 'lg:col-[1/5] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[3/13] lg:w-[auto] lg:ml-0';
      break;
    case '4:11':
      colClass1 = 'lg:col-[1/5] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[2/13] lg:w-[auto] lg:ml-0';
      break;
    case '4:100vw':
      colClass1 = 'lg:col-[1/5] lg:w-[auto] lg:ml-0';
      colClass2 = 'lg:col-[1/13] lg:w-[100vw] lg:ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
      break;
    case '100vw:12':
      colClass1 = 'lg:col-[1/13] lg:w-[100vw] lg:ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
      colClass2 = 'lg:col-[1/13] lg:w-[auto] lg:ml-0';
      break;
    default:
      break;
  }
  return { colClass1, colClass2 };
};

/**
 * Get tablet column proportions
 * @param {*} scale Proportion parameter
 * @returns Returns class names for col1 and col2
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
      colClass1 = 'md:col-[1/13] md:w-[100vw] md:ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
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
      colClass2 = 'md:col-[1/13] md:w-[100vw] md:ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
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
      colClass1 = 'md:col-[1/13] md:w-[100vw] md:ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
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
      colClass2 = 'md:col-[1/13] md:w-[100vw] md:ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
      break;
    case '100vw:12':
      colClass1 = 'md:col-[1/13] md:w-[100vw] md:ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
      colClass2 = 'md:col-[1/13]';
      break;
    default:
      break;
  }
  return { colClass1, colClass2 };
};

/**
 * Get mobile column proportions
 * @param {*} scale Proportion parameter
 * @returns Returns class names for col1 and col2
 */
const handlMColSpan = (scale) => {
  let colClass1 = '';
  let colClass2 = '';
  switch (scale) {
    case '1':
      colClass1 = 'col-[1/13]';
      colClass2 = 'col-[1/13]';
      break;
    case '2':
      colClass1 = 'col-[1/13] row-1';
      colClass2 = 'col-[1/13] row-1 w-[100vw] ml-[calc((100vw-var(--l4-column-width-12))/-2)]';
      break;
    default:
      break;
  }
  return { colClass1, colClass2 };
};

export default function decorate(block) {
  try {
    // Exit early if there are fewer than 2 children
    if (!block.children || block.children.length < 2) return;

    buildSecitonClass(block);
    const [col1, col2] = [...block.children];
    col1.classList.add('md:row-1', 'lg:row-1', 'md:order-1', 'md:z-1');
    col2.classList.add('md:row-1', 'lg:row-1', 'md:order-2');

    const config = block.dataset;
    // Set default values for layout variations
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
    config.colorgroup = config.colorgroup || '';

    // Add default width and height classes
    col1.classList.add('h-full');
    col2.classList.add('h-full');

    // 桌面端比例
    if (dlayoutvariation) {
      const dcolspan = config[`dcolspan${dlayoutvariation}`];
      if (dcolspan) {
        const { colClass1, colClass2 } = handlDColSpan(dcolspan);
        col1.classList.add(...colClass1.split(' '));
        col2.classList.add(...colClass2.split(' '));
      }
    }

    // 平板端比例
    if (config.tabletstackon === 'yes') {
      col1.classList.add('md:col-[1/13]', 'md:row-[1/2]');
      col2.classList.add('md:col-[1/13]', 'md:row-[2/3]');
    } else if (tlayoutvariation) {
      const tcolspan = config[`tcolspan${tlayoutvariation}`];
      if (tcolspan) {
        const { colClass1, colClass2 } = handlTColSpan(tcolspan);
        col1.classList.add(...colClass1.split(' '));
        col2.classList.add(...colClass2.split(' '));
      }
    }

    // 移动端比例
    if (mlayoutvariation) {
      const { colClass1, colClass2 } = handlMColSpan(mlayoutvariation);
      col1.classList.add(...colClass1.split(' '));
      col2.classList.add(...colClass2.split(' '));
    }

    // 上下对调，这些情况需要改排序
    if ((mreverse === 'yes' && mlayoutvariation === '1') || (mreverse === 'no' && mlayoutvariation === '2')) {
      col1.classList.add('order-2');
      col2.classList.add('order-1');
    }

    // 这个容器来限制宽度
    const container = document.createElement('div');
    if (config.colorgroup) {
      container.classList.add(config.colorgroup);
    }
    container.classList.add('grid', 'grid-cols-12', 'l4-column-width-12');
    container.append(col1, col2);
    block.append(container);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating container-2cols block:', error);
    block.innerHTML = '<div class="error-message">Failed to load container-2cols block</div>';
  }
}
