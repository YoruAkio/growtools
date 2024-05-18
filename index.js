const fs = require('fs');
const { program } = require('commander');

const items_secret_key = 'PBG892FXX982ABC*';

const byteToHex = [];
for (let n = 0; n <= 0xff; ++n) {
    byteToHex.push(n.toString(16).padStart(2, '0'));
}

function hex(arrayBuffer, is_without_space) {
    const buff = new Uint8Array(arrayBuffer);
    const hexOctets = [];
    for (let i = 0; i < buff.length; ++i) hexOctets.push(byteToHex[buff[i]]);
    return hexOctets.join(is_without_space ? '' : ' ');
}

function read_buffer_number(buffer, pos, len) {
    let value = 0;
    for (let a = 0; a < len; a++) value += buffer[pos + a] << (a * 8);
    return value;
}

function write_buffer_number(pos, len, value, buffer) {
    for (let a = 0; a < len; a++) {
        buffer[pos + a] = (value >> (a * 8)) & 255;
    }
}

function write_buffer_string(pos, len, value, using_key, item_id, buffer) {
    for (let a = 0; a < len; a++) {
        buffer[pos + a] = using_key
            ? value.charCodeAt(a) ^
              items_secret_key.charCodeAt(
                  (a + item_id) % items_secret_key.length,
              )
            : value.charCodeAt(a);
    }
}

function hexStringToArrayBuffer(pos, hexString, buffer) {
    hexString = hexString.replace(/ /g, '');
    if (hexString.length % 2 !== 0)
        console.log(
            'WARNING: expecting an even number of characters in the hexString',
        );
    hexString.match(/[\dA-F]{2}/gi).map(s => (buffer[pos++] = parseInt(s, 16)));
}

function read_buffer_string(buffer, pos, len, using_key, item_id) {
    let result = '';
    for (let a = 0; a < len; a++) {
        result += String.fromCharCode(
            using_key
                ? buffer[a + pos] ^
                      items_secret_key.charCodeAt(
                          (item_id + a) % items_secret_key.length,
                      )
                : buffer[a + pos],
        );
    }
    return result;
}

function process_item_encoder(result, using_txt) {
    const buffer = new Uint8Array(1024 * 1024); // Allocate a large buffer
    let mem_pos = 6;
    if (using_txt) {
        const resultLines = result.split('\n');
        for (let a = 0; a < resultLines.length; a++) {
            const result1 = resultLines[a].split('\\');
            if (result1[0] == 'version') {
                write_buffer_number(0, 2, Number(result1[1]), buffer);
            } else if (result1[0] == 'itemCount') {
                write_buffer_number(2, 4, Number(result1[1]), buffer);
            } else if (result1[0] == 'add_item') {
                // item id
                write_buffer_number(mem_pos, 4, result1[1], buffer);
                mem_pos += 4;

                buffer[mem_pos++] = Number(result1[2]); // editable type
                buffer[mem_pos++] = Number(result1[3]); // item category
                buffer[mem_pos++] = Number(result1[4]); // action type
                buffer[mem_pos++] = Number(result1[5]); // hit sound type

                // name
                write_buffer_number(mem_pos, 2, result1[6].length, buffer);
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result1[6].length,
                    result1[6],
                    1,
                    Number(result1[1]),
                    buffer,
                );
                mem_pos += result1[6].length;

                // texture
                write_buffer_number(mem_pos, 2, result1[7].length, buffer);
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result1[7].length,
                    result1[7],
                    buffer,
                );
                mem_pos += result1[7].length;

                // texture hash
                write_buffer_number(mem_pos, 4, result1[8], buffer);
                mem_pos += 4;

                buffer[mem_pos++] = Number(result1[9]); // item kind

                // val1
                write_buffer_number(mem_pos, 4, result1[10], buffer);
                mem_pos += 4;

                buffer[mem_pos++] = Number(result1[11]); // texture x
                buffer[mem_pos++] = Number(result1[12]); // texture y
                buffer[mem_pos++] = Number(result1[13]); // spread type
                buffer[mem_pos++] = Number(result1[14]); // is stripey wallpaper
                buffer[mem_pos++] = Number(result1[15]); // collision type

                // break hits
                buffer[mem_pos++] = result1[16].includes('r')
                    ? Number(result1[16].slice(0, -1))
                    : Number(result1[16]);

                // drop chance
                write_buffer_number(mem_pos, 4, result1[17], buffer);
                mem_pos += 4;

                buffer[mem_pos++] = Number(result1[18]); // clothing type

                // rarity
                write_buffer_number(mem_pos, 2, result1[19], buffer);
                mem_pos += 2;

                buffer[mem_pos++] = Number(result1[20]); // max amount

                // extra file
                write_buffer_number(mem_pos, 2, result1[21].length, buffer);
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result1[21].length,
                    result1[21],
                    buffer,
                );
                mem_pos += result1[21].length;

                // extra file hash
                write_buffer_number(mem_pos, 4, result1[22], buffer);
                mem_pos += 4;

                // audio volume
                write_buffer_number(mem_pos, 4, result1[23], buffer);
                mem_pos += 4;

                // pet name
                write_buffer_number(mem_pos, 2, result1[24].length, buffer);
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result1[24].length,
                    result1[24],
                    buffer,
                );
                mem_pos += result1[24].length;

                // pet prefix
                write_buffer_number(mem_pos, 2, result1[25].length, buffer);
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result1[25].length,
                    result1[25],
                    buffer,
                );
                mem_pos += result1[25].length;

                // pet suffix
                write_buffer_number(mem_pos, 2, result1[26].length, buffer);
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result1[26].length,
                    result1[26],
                    buffer,
                );
                mem_pos += result1[26].length;

                // pet ability
                write_buffer_number(mem_pos, 2, result1[27].length, buffer);
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result1[27].length,
                    result1[27],
                    buffer,
                );
                mem_pos += result1[27].length;

                buffer[mem_pos++] = Number(result1[28]); // seed base
                buffer[mem_pos++] = Number(result1[29]); // seed overlay
                buffer[mem_pos++] = Number(result1[30]); // tree base
                buffer[mem_pos++] = Number(result1[31]); // tree leaves

                // seed color (ARGB)
                let to_object = result1[32].split(',');
                buffer[mem_pos++] = to_object[0]; // seed color (A)
                buffer[mem_pos++] = to_object[1]; // seed color (R)
                buffer[mem_pos++] = to_object[2]; // seed color (G)
                buffer[mem_pos++] = to_object[3]; // seed color (B)

                // seed overlay color (ARGB)
                to_object = result1[33].split(',');
                buffer[mem_pos++] = to_object[0]; // seed color overlay (A)
                buffer[mem_pos++] = to_object[1]; // seed color overlay (A)
                buffer[mem_pos++] = to_object[2]; // seed color overlay (A)
                buffer[mem_pos++] = to_object[3]; // seed color overlay (A)

                // ingredients (Skip)
                write_buffer_number(mem_pos, 4, 0, buffer);
                mem_pos += 4;

                // grow time
                write_buffer_number(mem_pos, 4, result1[34], buffer);
                mem_pos += 4;

                // val2
                write_buffer_number(mem_pos, 2, result1[35], buffer);
                mem_pos += 2;

                // is rayman
                write_buffer_number(mem_pos, 2, result1[36], buffer);
                mem_pos += 2;

                // extra options
                write_buffer_number(mem_pos, 2, result1[37].length, buffer);
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result1[37].length,
                    result1[37],
                    buffer,
                );
                mem_pos += result1[37].length;

                // texture2
                write_buffer_number(mem_pos, 2, result1[38].length, buffer);
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result1[38].length,
                    result1[38],
                    buffer,
                );
                mem_pos += result1[38].length;

                // extra options2
                write_buffer_number(mem_pos, 2, result1[39].length, buffer);
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result1[39].length,
                    result1[39],
                    buffer,
                );
                mem_pos += result1[39].length;

                // Data (Position 80)
                hexStringToArrayBuffer(mem_pos, result1[40], buffer);
                mem_pos += 80;

                if (Number(result1[1]) >= 11) {
                    // punch options
                    write_buffer_number(mem_pos, 2, result1[41].length, buffer);
                    mem_pos += 2;
                    write_buffer_string(
                        mem_pos,
                        result1[41].length,
                        result1[41],
                        buffer,
                    );
                    mem_pos += result1[41].length;
                }
                if (Number(result1[1]) >= 12) {
                    hexStringToArrayBuffer(mem_pos, result1[42], buffer);
                    mem_pos += 13;
                }
                if (Number(result1[1]) >= 13) {
                    write_buffer_number(mem_pos, 4, result1[43], buffer);
                    mem_pos += 4;
                }
                if (Number(result1[1]) >= 14) {
                    write_buffer_number(mem_pos, 4, result1[44], buffer);
                    mem_pos += 4;
                }
                if (Number(result1[1]) >= 15) {
                    hexStringToArrayBuffer(mem_pos, result1[45], buffer);
                    mem_pos += 25;
                    write_buffer_number(mem_pos, 2, result1[46].length, buffer);
                    mem_pos += 2;
                    write_buffer_string(
                        mem_pos,
                        result1[46].length,
                        result1[46],
                        buffer,
                    );
                    mem_pos += result1[46].length;
                }
                if (Number(result1[1]) >= 16) {
                    write_buffer_number(mem_pos, 2, result1[47].length, buffer);
                    mem_pos += 2;
                    write_buffer_string(
                        mem_pos,
                        result1[47].length,
                        result1[47],
                        buffer,
                    );
                    mem_pos += result1[47].length;
                }
            }
        }
    } else {
        write_buffer_number(0, 2, result.version, buffer);
        write_buffer_number(2, 4, result.item_count, buffer);
        for (let a = 0; a < result.item_count; a++) {
            write_buffer_number(mem_pos, 4, result.items[a].item_id, buffer);
            mem_pos += 4;
            buffer[mem_pos++] = result.items[a].editable_type;
            buffer[mem_pos++] = result.items[a].item_category;
            buffer[mem_pos++] = result.items[a].action_type;
            buffer[mem_pos++] = result.items[a].hit_sound_type;
            write_buffer_number(
                mem_pos,
                2,
                result.items[a].name.length,
                buffer,
            );
            mem_pos += 2;
            write_buffer_string(
                mem_pos,
                result.items[a].name.length,
                result.items[a].name,
                1,
                result.items[a].item_id,
                buffer,
            );
            mem_pos += result.items[a].name.length;
            write_buffer_number(
                mem_pos,
                2,
                result.items[a].texture.length,
                buffer,
            );
            mem_pos += 2;
            write_buffer_string(
                mem_pos,
                result.items[a].texture.length,
                result.items[a].texture,
                buffer,
            );
            mem_pos += result.items[a].texture.length;
            write_buffer_number(
                mem_pos,
                4,
                result.items[a].texture_hash,
                buffer,
            );
            mem_pos += 4;
            buffer[mem_pos++] = result.items[a].item_kind;
            write_buffer_number(mem_pos, 4, result.items[a].val1, buffer);
            mem_pos += 4;
            buffer[mem_pos++] = result.items[a].texture_x;
            buffer[mem_pos++] = result.items[a].texture_y;
            buffer[mem_pos++] = result.items[a].spread_type;
            buffer[mem_pos++] = result.items[a].is_stripey_wallpaper;
            buffer[mem_pos++] = result.items[a].collision_type;

            buffer[mem_pos++] =
                isNaN(result.items[a].break_hits) &&
                result.items[a].break_hits.includes('r')
                    ? Number(result.items[a].break_hits.slice(0, -1))
                    : Number(result.items[a].break_hits) * 6;

            write_buffer_number(
                mem_pos,
                4,
                result.items[a].drop_chance,
                buffer,
            );
            mem_pos += 4;
            buffer[mem_pos++] = result.items[a].clothing_type;
            write_buffer_number(mem_pos, 2, result.items[a].rarity, buffer);
            mem_pos += 2;
            buffer[mem_pos++] = result.items[a].max_amount;
            write_buffer_number(
                mem_pos,
                2,
                result.items[a].extra_file.length,
                buffer,
            );
            mem_pos += 2;
            write_buffer_string(
                mem_pos,
                result.items[a].extra_file.length,
                result.items[a].extra_file,
                buffer,
            );
            mem_pos += result.items[a].extra_file.length;
            write_buffer_number(
                mem_pos,
                4,
                result.items[a].extra_file_hash,
                buffer,
            );
            mem_pos += 4;
            write_buffer_number(
                mem_pos,
                4,
                result.items[a].audio_volume,
                buffer,
            );
            mem_pos += 4;
            write_buffer_number(
                mem_pos,
                2,
                result.items[a].pet_name.length,
                buffer,
            );
            mem_pos += 2;
            write_buffer_string(
                mem_pos,
                result.items[a].pet_name.length,
                result.items[a].pet_name,
                buffer,
            );
            mem_pos += result.items[a].pet_name.length;
            write_buffer_number(
                mem_pos,
                2,
                result.items[a].pet_prefix.length,
                buffer,
            );
            mem_pos += 2;
            write_buffer_string(
                mem_pos,
                result.items[a].pet_prefix.length,
                result.items[a].pet_prefix,
                buffer,
            );
            mem_pos += result.items[a].pet_prefix.length;
            write_buffer_number(
                mem_pos,
                2,
                result.items[a].pet_suffix.length,
                buffer,
            );
            mem_pos += 2;
            write_buffer_string(
                mem_pos,
                result.items[a].pet_suffix.length,
                result.items[a].pet_suffix,
                buffer,
            );
            mem_pos += result.items[a].pet_suffix.length;
            write_buffer_number(
                mem_pos,
                2,
                result.items[a].pet_ability.length,
                buffer,
            );
            mem_pos += 2;
            write_buffer_string(
                mem_pos,
                result.items[a].pet_ability.length,
                result.items[a].pet_ability,
                buffer,
            );
            mem_pos += result.items[a].pet_ability.length;
            buffer[mem_pos++] = result.items[a].seed_base;
            buffer[mem_pos++] = result.items[a].seed_overlay;
            buffer[mem_pos++] = result.items[a].tree_base;
            buffer[mem_pos++] = result.items[a].tree_leaves;
            buffer[mem_pos++] = result.items[a].seed_color.a;
            buffer[mem_pos++] = result.items[a].seed_color.r;
            buffer[mem_pos++] = result.items[a].seed_color.g;
            buffer[mem_pos++] = result.items[a].seed_color.b;
            buffer[mem_pos++] = result.items[a].seed_overlay_color.a;
            buffer[mem_pos++] = result.items[a].seed_overlay_color.r;
            buffer[mem_pos++] = result.items[a].seed_overlay_color.g;
            buffer[mem_pos++] = result.items[a].seed_overlay_color.b;
            write_buffer_number(mem_pos, 4, 0, buffer); // skipping ingredients
            mem_pos += 4;
            write_buffer_number(mem_pos, 4, result.items[a].grow_time, buffer);
            mem_pos += 4;
            write_buffer_number(mem_pos, 2, result.items[a].val2, buffer);
            mem_pos += 2;
            write_buffer_number(mem_pos, 2, result.items[a].is_rayman, buffer);
            mem_pos += 2;
            write_buffer_number(
                mem_pos,
                2,
                result.items[a].extra_options.length,
                buffer,
            );
            mem_pos += 2;
            write_buffer_string(
                mem_pos,
                result.items[a].extra_options.length,
                result.items[a].extra_options,
                buffer,
            );
            mem_pos += result.items[a].extra_options.length;
            write_buffer_number(
                mem_pos,
                2,
                result.items[a].texture2.length,
                buffer,
            );
            mem_pos += 2;
            write_buffer_string(
                mem_pos,
                result.items[a].texture2.length,
                result.items[a].texture2,
                buffer,
            );
            mem_pos += result.items[a].texture2.length;
            write_buffer_number(
                mem_pos,
                2,
                result.items[a].extra_options2.length,
                buffer,
            );
            mem_pos += 2;
            write_buffer_string(
                mem_pos,
                result.items[a].extra_options2.length,
                result.items[a].extra_options2,
                buffer,
            );
            mem_pos += result.items[a].extra_options2.length;
            hexStringToArrayBuffer(
                mem_pos,
                result.items[a].data_position_80,
                buffer,
            );
            mem_pos += 80;
            if (result.version >= 11) {
                write_buffer_number(
                    mem_pos,
                    2,
                    result.items[a].punch_options.length,
                    buffer,
                );
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result.items[a].punch_options.length,
                    result.items[a].punch_options,
                    buffer,
                );
                mem_pos += result.items[a].punch_options.length;
            }
            if (result.version >= 12) {
                hexStringToArrayBuffer(
                    mem_pos,
                    result.items[a].data_version_12,
                    buffer,
                );
                mem_pos += 13;
            }
            if (result.version >= 13) {
                write_buffer_number(
                    mem_pos,
                    4,
                    result.items[a].int_version_13,
                    buffer,
                );
                mem_pos += 4;
            }
            if (result.version >= 14) {
                write_buffer_number(
                    mem_pos,
                    4,
                    result.items[a].int_version_14,
                    buffer,
                );
                mem_pos += 4;
            }
            if (result.version >= 15) {
                hexStringToArrayBuffer(
                    mem_pos,
                    result.items[a].data_version_15,
                    buffer,
                );
                mem_pos += 25;
                write_buffer_number(
                    mem_pos,
                    2,
                    result.items[a].str_version_15.length,
                    buffer,
                );
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result.items[a].str_version_15.length,
                    result.items[a].str_version_15,
                    buffer,
                );
                mem_pos += result.items[a].str_version_15.length;
            }
            if (result.version >= 16) {
                write_buffer_number(
                    mem_pos,
                    2,
                    result.items[a].str_version_16.length,
                    buffer,
                );
                mem_pos += 2;
                write_buffer_string(
                    mem_pos,
                    result.items[a].str_version_16.length,
                    result.items[a].str_version_16,
                    buffer,
                );
                mem_pos += result.items[a].str_version_16.length;
            }
            if (result.version >= 17) {
                write_buffer_number(
                    mem_pos,
                    4,
                    result.items[a].int_version_17,
                    buffer,
                );
                mem_pos += 4;
            }
            if (result.version >= 18) {
                write_buffer_number(
                    mem_pos,
                    4,
                    result.items[a].int_version_18,
                    buffer,
                );
                mem_pos += 4;
            }
        }
    }
    return buffer.buffer;
}

function item_encoder(file, using_txt) {
    const fileContent = fs.readFileSync(file, 'utf-8');
    try {
        const encodedBuffer = using_txt
            ? process_item_encoder(fileContent, 1)
            : process_item_encoder(JSON.parse(fileContent), 0);
        fs.writeFileSync('items.dat', encodedBuffer);
        console.log('items.dat encoded successfully!');
    } catch (error) {
        console.error('Error encoding items.dat:', error);
    }
}

function item_decoder(file, using_txt) {
    const buffer = fs.readFileSync(file);
    const arrayBuffer = new Uint8Array(buffer);
    let mem_pos = 6;
    const data_json = {};

    const version = read_buffer_number(arrayBuffer, 0, 2);
    const item_count = read_buffer_number(arrayBuffer, 2, 4);

    if (version > 18) {
        console.error(
            'Your items.dat version is ' +
                version +
                ', and This decoder doesnt support that version!',
        );
        return;
    }

    data_json.version = version;
    data_json.item_count = item_count;
    data_json.items = [];

    for (let a = 0; a < item_count; a++) {
        const item_id = read_buffer_number(arrayBuffer, mem_pos, 4);
        mem_pos += 4;

        const editable_type = arrayBuffer[mem_pos++];
        const item_category = arrayBuffer[mem_pos++];
        const action_type = arrayBuffer[mem_pos++];
        const hit_sound_type = arrayBuffer[mem_pos++];

        let len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        let name = read_buffer_string(
            arrayBuffer,
            mem_pos,
            len,
            true,
            Number(item_id),
        );
        mem_pos += len;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        const texture = read_buffer_string(arrayBuffer, mem_pos, len);
        mem_pos += len;

        const texture_hash = read_buffer_number(arrayBuffer, mem_pos, 4);
        mem_pos += 4;

        const item_kind = arrayBuffer[mem_pos++];

        const val1 = read_buffer_number(arrayBuffer, mem_pos, 4);
        mem_pos += 4;

        const texture_x = arrayBuffer[mem_pos++];
        const texture_y = arrayBuffer[mem_pos++];
        const spread_type = arrayBuffer[mem_pos++];
        const is_stripey_wallpaper = arrayBuffer[mem_pos++];
        const collision_type = arrayBuffer[mem_pos++];
        let break_hits = arrayBuffer[mem_pos++];

        break_hits = break_hits % 6 !== 0 ? break_hits + 'r' : break_hits / 6;

        const drop_chance = read_buffer_number(arrayBuffer, mem_pos, 4);
        mem_pos += 4;

        const clothing_type = arrayBuffer[mem_pos++];

        const rarity = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;

        const max_amount = arrayBuffer[mem_pos++];

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        const extra_file = read_buffer_string(arrayBuffer, mem_pos, len);
        mem_pos += len;

        const extra_file_hash = read_buffer_number(arrayBuffer, mem_pos, 4);
        mem_pos += 4;

        const audio_volume = read_buffer_number(arrayBuffer, mem_pos, 4);
        mem_pos += 4;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        const pet_name = read_buffer_string(arrayBuffer, mem_pos, len);
        mem_pos += len;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        const pet_prefix = read_buffer_string(arrayBuffer, mem_pos, len);
        mem_pos += len;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        const pet_suffix = read_buffer_string(arrayBuffer, mem_pos, len);
        mem_pos += len;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        const pet_ability = read_buffer_string(arrayBuffer, mem_pos, len);
        mem_pos += len;

        const seed_base = arrayBuffer[mem_pos++];
        const seed_overlay = arrayBuffer[mem_pos++];
        const tree_base = arrayBuffer[mem_pos++];
        const tree_leaves = arrayBuffer[mem_pos++];

        const seed_color_a = arrayBuffer[mem_pos++];
        const seed_color_r = arrayBuffer[mem_pos++];
        const seed_color_g = arrayBuffer[mem_pos++];
        const seed_color_b = arrayBuffer[mem_pos++];
        const seed_overlay_color_a = arrayBuffer[mem_pos++];
        const seed_overlay_color_r = arrayBuffer[mem_pos++];
        const seed_overlay_color_g = arrayBuffer[mem_pos++];
        const seed_overlay_color_b = arrayBuffer[mem_pos++];

        mem_pos += 4; // skipping ingredients

        const grow_time = read_buffer_number(arrayBuffer, mem_pos, 4);
        mem_pos += 4;

        const val2 = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        const is_rayman = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        const extra_options = read_buffer_string(arrayBuffer, mem_pos, len);
        mem_pos += len;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        const texture2 = read_buffer_string(arrayBuffer, mem_pos, len);
        mem_pos += len;

        len = read_buffer_number(arrayBuffer, mem_pos, 2);
        mem_pos += 2;
        const extra_options2 = read_buffer_string(arrayBuffer, mem_pos, len);
        mem_pos += len;

        const data_position_80 = hex(
            arrayBuffer.slice(mem_pos, mem_pos + 80),
            using_txt,
        ).toUpperCase();
        mem_pos += 80;

        let punch_options = '';
        let data_version_12 = '';
        let int_version_13 = 0;
        let int_version_14 = 0;
        let data_version_15 = '';
        let str_version_15 = '';
        let str_version_16 = '';
        let int_version_17 = 0;
        let int_version_18 = 0;

        if (version >= 11) {
            len = read_buffer_number(arrayBuffer, mem_pos, 2);
            mem_pos += 2;
            punch_options = read_buffer_string(arrayBuffer, mem_pos, len);
            mem_pos += len;
        }

        if (version >= 12) {
            data_version_12 = hex(
                arrayBuffer.slice(mem_pos, mem_pos + 13),
                using_txt,
            ).toUpperCase();
            mem_pos += 13;
        }

        if (version >= 13) {
            int_version_13 = read_buffer_number(arrayBuffer, mem_pos, 4);
            mem_pos += 4;
        }

        if (version >= 14) {
            int_version_14 = read_buffer_number(arrayBuffer, mem_pos, 4);
            mem_pos += 4;
        }

        if (version >= 15) {
            data_version_15 = hex(
                arrayBuffer.slice(mem_pos, mem_pos + 25),
                using_txt,
            ).toUpperCase();
            mem_pos += 25;
            len = read_buffer_number(arrayBuffer, mem_pos, 2);
            mem_pos += 2;
            str_version_15 = read_buffer_string(arrayBuffer, mem_pos, len);
            mem_pos += len;
        }
        if (version >= 16) {
            len = read_buffer_number(arrayBuffer, mem_pos, 2);
            mem_pos += 2;
            str_version_16 = read_buffer_string(arrayBuffer, mem_pos, len);
            mem_pos += len;
        }

        if (version >= 17) {
            int_version_17 = read_buffer_number(arrayBuffer, mem_pos, 4);
            mem_pos += 4;
        }

        if (version >= 18) {
            int_version_18 = read_buffer_number(arrayBuffer, mem_pos, 4);
            mem_pos += 4;
        }

        if (item_id !== a) {
            console.log(`Unordered Items at ${a}`);
        }

        data_json.items[a] = {};
        data_json.items[a].item_id = item_id;
        data_json.items[a].editable_type = editable_type;
        data_json.items[a].item_category = item_category;
        data_json.items[a].action_type = action_type;
        data_json.items[a].hit_sound_type = hit_sound_type;
        data_json.items[a].name = name;
        data_json.items[a].texture = texture;
        data_json.items[a].texture_hash = texture_hash;
        data_json.items[a].item_kind = item_kind;
        data_json.items[a].val1 = val1;
        data_json.items[a].texture_x = texture_x;
        data_json.items[a].texture_y = texture_y;
        data_json.items[a].spread_type = spread_type;
        data_json.items[a].is_stripey_wallpaper = is_stripey_wallpaper;
        data_json.items[a].collision_type = collision_type;
        data_json.items[a].break_hits = break_hits;
        data_json.items[a].drop_chance = drop_chance;
        data_json.items[a].clothing_type = clothing_type;
        data_json.items[a].rarity = rarity;
        data_json.items[a].max_amount = max_amount;
        data_json.items[a].extra_file = extra_file;
        data_json.items[a].extra_file_hash = extra_file_hash;
        data_json.items[a].audio_volume = audio_volume;
        data_json.items[a].pet_name = pet_name;
        data_json.items[a].pet_prefix = pet_prefix;
        data_json.items[a].pet_suffix = pet_suffix;
        data_json.items[a].pet_ability = pet_ability;
        data_json.items[a].seed_base = seed_base;
        data_json.items[a].seed_overlay = seed_overlay;
        data_json.items[a].tree_base = tree_base;
        data_json.items[a].tree_leaves = tree_leaves;

        if (using_txt) {
            data_json.items[
                a
            ].seed_color = `${seed_color_a},${seed_color_r},${seed_color_g},${seed_color_b}`;
            data_json.items[
                a
            ].seed_overlay_color = `${seed_overlay_color_a},${seed_overlay_color_r},${seed_overlay_color_g},${seed_overlay_color_b}`;
        } else {
            data_json.items[a].seed_color = {
                a: seed_color_a,
                r: seed_color_r,
                g: seed_color_g,
                b: seed_color_b,
            };
            data_json.items[a].seed_overlay_color = {
                a: seed_overlay_color_a,
                r: seed_overlay_color_r,
                g: seed_overlay_color_g,
                b: seed_overlay_color_b,
            };
        }

        data_json.items[a].grow_time = grow_time;
        data_json.items[a].val2 = val2;
        data_json.items[a].is_rayman = is_rayman;
        data_json.items[a].extra_options = extra_options;
        data_json.items[a].texture2 = texture2;
        data_json.items[a].extra_options2 = extra_options2;
        data_json.items[a].data_position_80 = data_position_80;
        data_json.items[a].punch_options = punch_options;
        data_json.items[a].data_version_12 = data_version_12;
        data_json.items[a].int_version_13 = int_version_13;
        data_json.items[a].int_version_14 = int_version_14;
        data_json.items[a].data_version_15 = data_version_15;
        data_json.items[a].str_version_15 = str_version_15;
        data_json.items[a].str_version_16 = str_version_16;
        data_json.items[a].int_version_17 = int_version_17;
        data_json.items[a].int_version_18 = int_version_18;
    }

    fs.writeFileSync(
        using_txt ? 'items.txt' : 'items.json',
        using_txt
            ? `version\\${data_json.version}\nitemCount\\${
                  data_json.item_count
              }\n\n${data_json.items
                  .map(item => `add_item\\${Object.values(item).join('\\')}`)
                  .join('\n')}`
            : JSON.stringify(data_json, null, 4),
    );
    console.log('items.dat decoded successfully!');
}

program
    .option('-e, --encode', 'Encode items.dat')
    .option('-d, --decode', 'Decode items.dat')
    .option('-f, --file <file>', 'Path to items.dat file')
    .option('-t, --txt', 'Use text format for decoding/encoding');

program.parse(process.argv);

const options = program.opts();

if (options.encode) {
    item_encoder(options.file, options.txt);
} else if (options.decode) {
    item_decoder(options.file, options.txt);
} else {
    console.error('Please specify either -encode or -decode flag');
}
