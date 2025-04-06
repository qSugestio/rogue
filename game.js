$(function () {
  var WIDTH = 40;
  var HEIGHT = 24;

  // Состояние игры
  var map = [];
  for (var row = 0; row < HEIGHT; row++) {
    map[row] = [];
    for (var col = 0; col < WIDTH; col++) {
      map[row][col] = '#';
    }
  }
  var items = []; // Мечи и зелья
  var hero = { health: 100, maxHealth: 100, strength: 10 }; // Герой
  var enemies = []; // Противники

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function findEnemyAt(x, y) {
    for (var i = 0; i < enemies.length; i++) {
      if (enemies[i].x === x && enemies[i].y === y) {
        return enemies[i]; // Возвращаем врага, если найден
      }
    }
    return null; // Возвращаем null, если враг не найден
  }

  // Функция для поиска предмета на координатах (x, y)
  function findItemAt(x, y) {
    for (var j = 0; j < items.length; j++) {
      if (items[j].x === x && items[j].y === y) {
        return items[j]; // Возвращаем предмет, если найден
      }
    }
    return null; // Возвращаем null, если предмет не найден
  }

  // Генерация карты
  function generateMap() {
    // Размещение комнат
    var numRooms = randomBetween(5, 10); // 5-10 комнат
    for (var i = 0; i < numRooms; i++) {
      var h = randomBetween(3, 8); // Высота 3-8
      var w = randomBetween(3, 8); // Ширина 3-8
      var x = Math.floor(Math.random() * (WIDTH - w));
      var y = Math.floor(Math.random() * (HEIGHT - h));
      for (var dy = 0; dy < h; dy++) {
        for (var dx = 0; dx < w; dx++) {
          map[y + dy][x + dx] = '.';
        }
      }
    }

    // Размещение проходов
    var numHoriz = randomBetween(3, 5); // 3-5 горизонтальных
    var numVert = randomBetween(3, 5); // 3-5 вертикальных
    for (var i = 0; i < numHoriz; i++) {
      var y = Math.floor(Math.random() * HEIGHT);
      for (var x = 0; x < WIDTH; x++) {
        map[y][x] = '.';
      }
    }
    for (var i = 0; i < numVert; i++) {
      var x = Math.floor(Math.random() * WIDTH);
      for (var y = 0; y < HEIGHT; y++) {
        map[y][x] = '.';
      }
    }
  }

  // Сбор пустых клеток
  function getFloorCells() {
    var floorCells = [];
    for (var y = 0; y < HEIGHT; y++) {
      for (var x = 0; x < WIDTH; x++) {
        if (map[y][x] === '.') {
          floorCells.push({ x: x, y: y });
        }
      }
    }
    shuffle(floorCells);
    return floorCells;
  }

  // Перемешивание массива
  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  // Размещение объектов
  function placeObjects() {
    var floorCells = getFloorCells();

    // Мечи (2 шт)
    for (var i = 0; i < 2; i++) {
      var cell = floorCells.pop();
      items.push({ type: 'sword', x: cell.x, y: cell.y });
    }

    // Зелья здоровья (10 шт)
    for (var i = 0; i < 10; i++) {
      var cell = floorCells.pop();
      items.push({ type: 'potion', x: cell.x, y: cell.y });
    }

    // Герой
    var heroCell = floorCells.pop();
    hero.x = heroCell.x;
    hero.y = heroCell.y;

    // Противники (10 шт)
    for (var i = 0; i < 10; i++) {
      var cell = floorCells.pop();
      enemies.push({
        x: cell.x,
        y: cell.y,
        health: 100,
        maxHealth: 100,
        strength: 5,
      });
    }
  }

  // Отрисовка карты
  function render() {
    var $field = $('.field');
    $field.empty();

    for (var y = 0; y < HEIGHT; y++) {
      for (var x = 0; x < WIDTH; x++) {
        var $tile = $('<div class="tile"></div>');

        if (map[y][x] === '#') {
          $tile.addClass('wall');
        } else {
          if (hero.x === x && hero.y === y) {
            $tile.addClass('hero');
            var healthPercent = (hero.health / hero.maxHealth) * 100;
            $tile.append(
              '<div class="health" style="width: ' + healthPercent + '%"></div>'
            );
          } else {
            var enemy = findEnemyAt(x, y);
            if (enemy) {
              $tile.addClass('enemy');
              var enemyHealthPercent = (enemy.health / enemy.maxHealth) * 100;
              $tile.append(
                '<div class="health" style="width: ' +
                  enemyHealthPercent +
                  '%"></div>'
              );
            } else {
              var item = findItemAt(x, y);
              if (item) {
                $tile.addClass(item.type === 'sword' ? 'sword' : 'potion');
              } else {
                $tile.addClass('floor');
              }
            }
          }
        }

        $field.append($tile);
      }
    }
  }

  // Атака героя
  function heroAttack() {
    var adjacent = [
      { x: hero.x - 1, y: hero.y },
      { x: hero.x + 1, y: hero.y },
      { x: hero.x, y: hero.y - 1 },
      { x: hero.x, y: hero.y + 1 },
    ];
    for (var i = 0; i < adjacent.length; i++) {
      var enemyIndex = -1;
      for (var j = 0; j < enemies.length; j++) {
        if (enemies[j].x === adjacent[i].x && enemies[j].y === adjacent[i].y) {
          enemyIndex = j;
          break;
        }
      }

      if (enemyIndex !== -1) {
        enemies[enemyIndex].health -= hero.strength;
        if (enemies[enemyIndex].health <= 0) {
          enemies.splice(enemyIndex, 1);
        }
      }
    }
  }

  // Действия противников
  function enemiesAction() {
    for (var i = 0; i < enemies.length; i++) {
      var distance =
        Math.abs(enemies[i].x - hero.x) + Math.abs(enemies[i].y - hero.y);
      if (distance === 1) {
        hero.health -= enemies[i].strength;
        if (hero.health <= 0) {
          alert('Игра окончена');
          return;
        }
      } else {
        var directions = [
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
        ];
        shuffle(directions);
        for (var j = 0; j < directions.length; j++) {
          var nx = enemies[i].x + directions[j].dx;
          var ny = enemies[i].y + directions[j].dy;
          if (
            nx >= 0 &&
            nx < WIDTH &&
            ny >= 0 &&
            ny < HEIGHT &&
            map[ny][nx] === '.' &&
            !findEnemyAt(nx, ny) &&
            !(hero.x === nx && hero.y === ny)
          ) {
            enemies[i].x = nx;
            enemies[i].y = ny;
            break;
          }
        }
      }
    }
  }

  // Обработка ввода
  $(document).on('keydown', function (e) {
    var dx = 0,
      dy = 0;
    switch (e.key) {
      case 'a':
        dx = -1;
        break;
      case 'd':
        dx = 1;
        break;
      case 'w':
        dy = -1;
        break;
      case 's':
        dy = 1;
        break;
      case ' ':
        heroAttack();
        enemiesAction();
        render();
        return;
      default:
        return;
    }

    var nx = hero.x + dx;
    var ny = hero.y + dy;
    if (
      nx >= 0 &&
      nx < WIDTH &&
      ny >= 0 &&
      ny < HEIGHT &&
      map[ny][nx] === '.' &&
      !findEnemyAt(nx, ny)
    ) {
      hero.x = nx;
      hero.y = ny;

      // Проверка на предметы
      var item = findItemAt(nx, ny);
      if (item !== null) {
        if (item.type === 'sword') {
          hero.strength += 5;
        } else if (item.type === 'potion') {
          hero.health = Math.min(hero.health + 20, hero.maxHealth);
        }
        var itemIndex = items.indexOf(item); // Получаем индекс предмета
        if (itemIndex !== -1) {
          items.splice(itemIndex, 1); // Удаляем предмет, если он найден
        }
      }

      enemiesAction();
      render();
    }
  });

  // Инициализация игры
  generateMap();
  placeObjects();
  render();
});
