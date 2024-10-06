"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertImagePathTest = convertImagePathTest;
exports.getInGameHeroes = getInGameHeroes;
exports.getHeroStartingStats = getHeroStartingStats;
var fs = require("fs");
var jsonpath = "../data/CharactersV2/CharactersV3.json";
var data = fs.readFileSync(jsonpath, null).toString();
var GameHeroes = JSON.parse(data);
//const CV3 = require(jsonpath);
//Stats Variables
var SSD = 'm_ShopStatDisplay';
var eWSD = 'm_eWeaponStatsDisplay';
var eVSD = 'm_eVitalityStatsDisplay';
var eSSD = 'm_eSpiritStatsDisplay';
var vDS = 'm_vecDisplayStats';
var vODS = 'm_vecOtherDisplayStats';
function convertImagePathTest(imagePath) {
    var cleanPath = imagePath.replace(/^panorama:"/, '').replace(/"$/, '');
    var match = cleanPath.match(/file:\/\/\{images\}\/(.+)/);
    if (match) {
        var pngPath = match[1];
        pngPath = pngPath.replace('.psd', '_psd.png');
        return "/images/".concat(pngPath);
    }
    return imagePath;
}
//Gives list of heroes in game; .name = hero_xxxx, .data = all data under hero_xxxx in CharactersV3.json
function getInGameHeroes() {
    return __awaiter(this, void 0, void 0, function () {
        var FilteredHeroes;
        return __generator(this, function (_a) {
            FilteredHeroes = Object.entries(GameHeroes)
                .filter(function (entry) {
                var codename = entry[0], data = entry[1];
                return data.m_bPlayerSelectable === true && data.m_bDisabled === false && data.m_bInDevelopment === false ? data : undefined;
            })
                .map(function (_a) {
                var codenames = _a[0], heroData = _a[1];
                return ({
                    name: codenames,
                    data: __assign(__assign({}, heroData), { m_strIconHeroCard: convertImagePathTest(heroData.m_strIconHeroCard) }),
                });
            });
            return [2 /*return*/, FilteredHeroes];
        });
    });
}
function getHeroStartingStats(name) {
    return __awaiter(this, void 0, void 0, function () {
        var hero_id, hero_ids, w_vDS, w_vODS, v_vDS, v_vODS, s_vDS, allStatNames, startStats, StatsZero, key;
        return __generator(this, function (_a) {
            hero_id = "hero_".concat(name.toLowerCase());
            hero_ids = ("hero_".concat(name.toLowerCase())).toString();
            w_vDS = Object.values(GameHeroes[hero_id][SSD][eWSD][vDS]);
            w_vODS = Object.values(GameHeroes[hero_id][SSD][eWSD][vODS]);
            v_vDS = Object.values(GameHeroes[hero_id][SSD][eVSD][vDS]);
            v_vODS = Object.values(GameHeroes[hero_id][SSD][eVSD][vODS]);
            s_vDS = Object.values(GameHeroes[hero_id][SSD][eSSD][vDS]);
            allStatNames = Object.values(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], w_vDS, true), w_vODS, true), v_vDS, true), v_vODS, true), s_vDS, true));
            startStats = GameHeroes[hero_id]['m_mapStartingStats'];
            StatsZero = [];
            allStatNames.map(function (key, index) {
                StatsZero[index] = { name: key, stats: 0 };
            });
            for (key in startStats) {
                StatsZero = StatsZero.map(function (_a) {
                    var name = _a.name, stats = _a.stats;
                    if (name === key) {
                        return {
                            name: name,
                            stats: startStats[key] !== undefined ? startStats[key] : 0,
                        };
                    }
                    else {
                        return { name: name, stats: stats, };
                    }
                });
            }
            return [2 /*return*/, StatsZero];
        });
    });
}
// const w_vDS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eWSD][vDS]);
// const w_vODS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eWSD][vODS]);
// const v_vDS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eVSD][vDS]);
// const v_vODS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eVSD][vODS]);
// const s_vDS : Array<string> = Object.values(CV3['hero_inferno'][SSD][eSSD][vDS]);
// const allStatsInferno : Array<string> = Object.values([...w_vDS, ...w_vODS, ...v_vDS, ...v_vODS, ...s_vDS]);
// var StatsZero = [{}] as HeroStats[] ;
// allStatsInferno.map((key, index) => {
//     StatsZero[index] = {name: key, stats : 0}
// });
// console.log(StatsZero)
//const StartStats = CV3['hero_haze']['m_mapStartingStats'];
//console.log(GameHeroes['hero_haze']['m_mapStartingStats']['EMaxMoveSpeed'])
getHeroStartingStats('haze').then(function (hazeStats) {
    return console.log(hazeStats);
});
// getInGameHeroes().then(heroesdata => {
//     console.log(heroesdata[0].data.m_strIcon)
// })
