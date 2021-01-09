#!/usr/bin/env node

/**
 *  1. 先去http://www.cwl.gov.cn/kjxx/wqkj/拿往期的号码
 *  2. 根据往期号码计算权重生成一个权重号码池
 *  3. 从号码池随机取一个
 */

/**
 * TODO:
 *  1. 输出权重
 *  2. 出现次数最少视为权重最大(目前出现次数越多权重越高)
 */
import * as lib from "./lib.mjs"
import { print } from "./lib.mjs";

lib.print( "正在拉取往期数据!" )
const result = await lib.fetch_history( 100 )
const pool = lib.create_random_pool( result )
const red_pool = pool.red.map( val => lib.build_random_number_pool( lib.calc_weight( val, 33 ) ) )
const blue_pool = lib.build_random_number_pool( lib.calc_weight( pool.blue, 16 ) )
const red_total_pool = lib.build_random_number_pool( lib.calc_weight( pool.total, 33 ) )

const one = await lib.gen_numbers( red_pool, blue_pool )
const two = await lib.gen_numbers( new Array( 6 ).fill( red_total_pool ), blue_pool )

print( "" )
console.log( "生成时间: %s", lib.current_date_string() )
console.log( "随机第一注: %s", one )
console.log( "随机第二注: %s", two )
