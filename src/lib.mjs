import superagent from 'superagent';
import chalk from 'chalk';
import randomNumber from "random-number-csprng"

/**
 * @param {number} min
 * @param {number} max
 * @returns {Promise<number>}
 */
function getRandomNumber( min, max ) {
  return randomNumber( min, max )
}

/**
 * @param {*[]} list
 * @param {number} i
 * @param {number} j
 */
function swap( list, i, j ) {
  const temp = list[ i ];
  list[ i ] = list[ j ];
  list[ j ] = temp;
}

/**
 * @param {*[]} list
 * @returns {*[]}
 */
function random_list( list ) {
  let index = list.length
  while ( --index ) {
    swap( list, index, Math.floor( Math.random() * index ) )
  }
  return list
}

/**
 * @param {*[]} numbers
 * @returns {Promise<*>}
 */
async function get_single_random_number( numbers ) {
  const index = await getRandomNumber( 0, numbers.length - 1 )
  return numbers[ index ]
  // return numbers[ Math.floor( Math.random() * numbers.length ) ]
}

/**
 * @param {string} char
 */
export function print( char ) {
  process.stdout.clearLine( -1 );
  process.stdout.cursorTo( 0 );
  process.stdout.write( char );
}


/**
 * @typedef {Object} history_item
 * @property {string} blue
 * @property {string} red
 * @property {string} code
 */
/**
 * @param {number} count
 * @returns {Promise<history_item[]>}}
 */
export async function fetch_history( count ) {
  const result = await superagent
    .get( "http://www.cwl.gov.cn/cwl_admin/kjxx/findDrawNotice" )
    .query( { name: "ssq", issueCount: count } )
    .set( "Referer", "http://www.cwl.gov.cn/kjxx/wqkj/" )
  if ( result.body.message === "查询成功" ) {
    return result.body.result
  }
  return []
}

/**
 * @typedef number_pool
 * @property {number[]} blue
 * @property {number[]} red1
 * @property {number[]} red2
 * @property {number[]} red3
 * @property {number[]} red4
 * @property {number[]} red5
 * @property {number[]} red6
 * @property {number[]} total
 * @property {number[][]} red
 */
/**
 * @param {history_item[]} original_data
 */
export function create_random_pool( original_data ) {
  const total_red_list = [ [], [], [], [], [], [] ]
  const pool = { blue: [], red: total_red_list, red1: [], red2: [], red3: [], red4: [], red5: [], red6: [], total: [] }
  for ( let item of original_data ) {
    pool.blue.push( parseInt( item.blue, 10 ) )
    const red_numbers = item.red.split( "," )
    for ( let i = 0; i < 6; i++ ) {
      const num = parseInt( red_numbers[ i ], 10 )
      pool[ "red" + (i + 1).toString() ].push( num )
      pool.red[ i ].push( num )
      pool.total.push( num )
    }
  }
  return pool
}

/**
 *
 * @param {*[]} numbers
 * @param {number} size
 * @param {number|boolean} print
 * @returns {number[]}
 */
export function calc_weight( numbers, size, print = false ) {
  const weight = new Array( size ).fill( 0 )
  for ( let num of numbers ) {
    weight[ num - 1 ] += 1
  }
  if ( typeof print === "number" ) {
    const maxIndex = weight.reduce( ( p, c, i ) => weight[ p ] <= c ? i : p, 0 ) + 1
    const color = print < 7 ? chalk.red : chalk.blue
    console.log( `第${ print }个球权重最高的是: `, color( maxIndex.toString().padStart( 2, "0" ) ) )
  }
  return weight
}

/**
 * @param {number[]} weight_list
 * @returns {{}}
 */
export function get_weight_object( weight_list ) {
  const weight = {}
  for ( let j = 0; j < weight_list.length; j++ ) {
    weight[ (j + 1).toString().padStart( 2, "0" ) ] = weight_list[ j ]
  }
  return weight
}

/**
 * @param {*[]} bucket_list
 * @returns {*[]}
 */
export function build_random_number_pool( bucket_list ) {
  const result = []
  for ( let i = 0, len = bucket_list.length; i < len; i++ ) {
    const val = bucket_list[ i ];
    for ( let j = 0; j < val; j++ ) {
      result.push( i + 1 )
    }
  }
  return random_list( result )
}

/**
 * @param {number[]} red
 * @returns {boolean}
 */
function verify( red ) {
  for ( let i = 0; i < 6; i++ ) {
    if ( red[ i ] >= red[ i + 1 ] ) {
      return false
    }
  }
  return true
}

/**
 * @param {number[][]} red_numbers
 * @param {number[]} blue_numbers
 * @returns {Promise<string>}
 */
export async function gen_numbers( red_numbers, blue_numbers ) {
  const red = []
  while ( true ) {
    red.length = 0
    for ( const nums of red_numbers ) {
      print( "正在计算随机球号!" )
      const num = await get_single_random_number( nums )
      red.push( num )
    }
    if ( verify( red ) ) {
      break
    }
  }
  const blue = await get_single_random_number( blue_numbers )
  const r = red.map( v => chalk.red( v.toString().padStart( 2, "0" ) ) ).join( ", " )
  const b = chalk.blue( blue.toString().padStart( 2, "0" ) )
  return r + ", " + b
}

/**
 * @returns {string}
 */
export function current_date_string() {
  const today = new Date()
  const y = today.getFullYear()
  const m = (today.getMonth() + 1).toString().padStart( 2, '0' )
  const d = today.getDate().toString().padStart( 2, '0' )
  const h = today.getHours().toString().padStart( 2, '0' )
  const mm = today.getMinutes().toString().padStart( 2, '0' )
  return `${ y }-${ m }-${ d } ${ h }:${ mm }`
}

