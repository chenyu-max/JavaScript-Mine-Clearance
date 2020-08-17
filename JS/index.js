function Mine(tr, td, mineNum) {
    this.tr = tr; // tr表示行数  
    this.td = td; // td表示列数  
    this.mineNum = mineNum; // mineNum表示雷的数量

    this.squares = []; // 存储所有方块的信息，是一个二维数组，按照行与列的顺序排放，存取都按照行列方式
    this.tds = []; // 存储所有单元格的DOM
    this.surplusMine = mineNum; // 剩余雷的数量
    this.allRight = false; // 右击标注的小红旗是否全部是雷，用来判断用户是否游戏成功
    this.parent = document.querySelector('.gameBox');
}

// 生成n个不重复的数字
Mine.prototype.randomNum = function () {
    var square = new Array(this.tr * this.td); // 生成一个空数组  长度为格子总数
    for (var i = 0; i < square.length; i++) {
        square[i] = i;
    }
    // 数组乱序
    square.sort(function () {
        return 0.5 - Math.random()
    });
    return square.slice(0, this.mineNum);
};

Mine.prototype.init = function () {
    // this.randomNum();
    var rn = this.randomNum(); // 雷在格子里的位置
    var n = -1; // 用来找到对应的索引格子
    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for (var j = 0; j < this.td; j++) {
            // 取一个方块在数组里的数据，要使用行与列的形式存取
            // 找方块周围的方块的时候，要用坐标的形式去取
            // 行与列的形式，和坐标的形式，x，y是刚好相反的
            n++;
            if (rn.indexOf(n) != -1) {
                // 如果这个条件成立，说明现在循环到的索引在雷的数组里面找到了，那就表明这个索引对应的是个雷
                this.squares[i][j] = {
                    type: 'mine',
                    x: j,
                    y: i
                };

            } else {
                this.squares[i][j] = {
                    type: 'number',
                    x: j,
                    y: i,
                    value: 0
                };
            }
        }
    }

    this.updateNum();
    this.createDom();

    this.parent.oncontextmenu = function () {
        return false;
        // 阻止右键出菜单事件
    }

    // 剩余雷数
    this.mineNumDom = document.querySelector('.mineNum');
    this.mineNumDom.innerHTML = this.surplusMine;
};

// 创建表格
Mine.prototype.createDom = function () {
    var This = this;
    var table = document.createElement('table');
    for (var i = 0; i < this.tr; i++) { // 行
        var domTr = document.createElement('tr');
        this.tds[i] = [];
        for (var j = 0; j < this.td; j++) { // 列
            var domTd = document.createElement('td');
            this.tds[i][j] = domTd; // 把所有创建的td添加到数组当中
            domTd.pos = [i, j]; // 把格子对应的行和列村到格子身上，为了下面通过这个值去数组里面取到对应的数据
            domTd.onmousedown = function () {
                This.play(event, this); // 大的This 指的是实例对象   小的this指的是点击的domTd 
            };

            // if (this.squares[i][j].type == 'mine') {
            //     domTd.className = 'mine';
            // }
            // if (this.squares[i][j].type == 'number') {
            //     domTd.innerHTML = this.squares[i][j].value;
            // }

            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = ''; // 避免多次点击创建多个

    this.parent.appendChild(table);
};

// 找某个方格周围的八个格子
Mine.prototype.getAround = function (square) {
    var x = square.x,
        y = square.y;
    var result = []; // 把找到的格子的坐标返回出去（二维数组）
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (i < 0 ||
                j < 0 ||
                i > this.td - 1 ||
                j > this.tr - 1 ||
                // 上述表示出边界
                (i == x && j == y) ||
                // 表示循环到自己
                this.squares[j][i].type == 'mine'
                // 表示循环到（周围的格子）雷 (注意i和j表示的是坐标，而squares存储的是行和列)
            ) {
                continue;
            }
            // 要以行与列的形式返回出去，因为到时候需要它去取数组里的数据
            result.push([j, i]);
        }
    }
    return result;
}

// 更新所有的数字
Mine.prototype.updateNum = function () {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            // 要更新的是雷周围的数字
            if (this.squares[i][j].type == 'number') {
                continue;
            }
            var num = this.getAround(this.squares[i][j]); // 获取到每一个雷周围的数字
            for (var k = 0; k < num.length; k++) {
                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
};

Mine.prototype.play = function (ev, obj) {
    var This = this;
    if (ev.which == 1 && obj.className != 'flag') { // 后面的条件是为了用户右键之后不能点击
        // 点击的是左键
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
        // cl 存储className

        if (curSquare.type == 'number') {
            // 用户点击的是数字
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];

            // 点到了数字零
            if (curSquare.value == 0) {
                /* 
                    递归思路： 
                    1.显示自己
                    2.查找四周
                        1) 显示四周（如果四周的值不为零，那就显示到这，不需要再找了）
                        2）如果值为零了
                            a.显示自己
                            b.找四周（如果四周的值不为零，那就显示到这，不需要再找了）
                                I.显示自己
                                II.找四周（如果四周的值不为零，那就显示到这，不需要再找了）
                                    。。。。。。
                 */

                obj.innerHTML = ''; // 显示为空
                function getAllZero(square) {
                    var around = This.getAround(square); // 找到了周围N个格子
                    for (var i = 0; i < around.length; i++) {
                        var x = around[i][0]; // 行
                        var y = around[i][1]; // 列
                        This.tds[x][y].className = cl[This.squares[x][y].value];

                        if (This.squares[x][y].value == 0) {
                            // 如果以某个格子为中心，找到的某个格子为零，那就接着调用（递归）
                            if (!This.tds[x][y].check) {
                                // 给对应的td 添加一条属性，如果找过的话，这个值就为true，下一次就不会再找了，防止函数调用栈出问题
                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y]);
                            }

                        } else {
                            // 如果以某个格子为中心找到的四周的值不为零，就把数字显示出来
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }

                }
                getAllZero(curSquare);
            }

        } else {
            // 用户点击的是雷
            this.gameOver(obj);
        }
    }
    if (ev.which == 3) {
        // 用户点击的是右键
        // 如果右击的是一个数字，就不能点击
        if (obj.className && obj.className != 'flag') {
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag'; // 切换calss 有无

        if (this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
            this.allRight = true;
        } else {
            this.allRight = false;
        }

        if (obj.className == 'flag') {
            this.mineNumDom.innerHTML = --this.surplusMine;
        } else {
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }

        if (this.surplusMine == 0) {
            // 剩余的雷的数量为0，表示用户已经标完小红旗了，这时候要判断游戏是成功还是结束
            if (this.allRight == true) {
                // 这个条件成立，说明用户全部标对了
                alert('恭喜你，游戏通过');
                for (i = 0; i < this.tr; i++) {
                    for (j = 0; j < this.td; j++) {
                        this.tds[i][j].onmousedown = null;
                    }
                }

            } else {
                alert('游戏失败');
                this.gameOver();
            }
        }
    }
}

// 游戏失败函数
Mine.prototype.gameOver = function (clickTd) {
    /* 
        1.显示所有的雷
        2.取消所有格子的点击事件
        3.给点中的格子标红
    */
    for (i = 0; i < this.tr; i++) {
        for (j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'mine') {
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
    }
    if (clickTd) {
        clickTd.style.backgroundColor = '#f00';
    }
}

// var mine = new Mine(28, 28, 99);
// mine.init();

// 添加 button 的功能
var btns = document.getElementsByTagName('button');
var mine = null; // 用来存储生成的实例
var ln = 0; // 用来处理当前选中的状态
var arr = [
    [9, 9, 10],
    [16, 16, 40],
    [28, 28, 99]
]; //不同级别的行数，列数，雷数
for (let i = 0; i < btns.length - 1; i++) {
    btns[i].onclick = function () {
        btns[ln].className = '';
        this.className = 'active';
        mine = new Mine(arr[i][0], arr[i][1], arr[i][2]);
        mine.init();
        ln = i;
    }
}
btns[0].onclick(); // 初始化
btns[3].onclick = function () {
    for (var i = 0; i < btns.length - 1; i++) {
        if (btns[i].className == 'active') {
            btns[i].onclick();
        }
    }
}