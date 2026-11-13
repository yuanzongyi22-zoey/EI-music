'use client'
import type { ReactNode } from 'react'
import type { ScreenDef, ScreenId, SubTab } from '../types'
import { Account } from './account'
import { MyProjects, MySamples, ProjectEditor, ProjectPlayer, SampleFx } from './create'
import {
  LabChance,
  LabChanceKeywords,
  LabChancePlayer,
  LabFx,
  LabFxRun,
  LabHub,
  LabPicture,
  LabPictureAlbum,
  LabVoice,
  LabVoiceResult,
} from './lab'
import { Chat, Feed, FriendDiscover, GroupDetail, Groups, PostDetail, Social } from './community'
import { InstrumentCategory, InstrumentPlay, Instruments, KnowledgeResult, Theory, TheoryLesson } from './instrument'

/** 9 个 tab 根屏，对应原稿 1/2/3、6、14/15/16、17/18。 */
export const SUB_SCREENS: Record<SubTab, () => ReactNode> = {
  projects: MyProjects,
  samples: MySamples,
  sampleFx: SampleFx,
  hub: LabHub,
  feed: Feed,
  groups: Groups,
  social: Social,
  instruments: Instruments,
  theory: Theory,
}

const screen = (title: string, tab: ScreenDef['tab'], Body: () => ReactNode, chrome: ScreenDef['chrome'] = 'detail'): ScreenDef => ({
  title,
  tab,
  chrome,
  Body,
})

export const SCREENS: Record<ScreenId, ScreenDef> = {
  account: screen('个人账户', 'create', Account),
  projectEditor: screen('项目编辑器', 'create', ProjectEditor),
  projectPlayer: screen('作品详情', 'create', ProjectPlayer),
  labChance: screen('偶然音乐', 'lab', LabChance),
  labChanceKeywords: screen('选择关键词', 'lab', LabChanceKeywords),
  labChancePlayer: screen('偶然音乐 · 生成结果', 'lab', LabChancePlayer),
  labFx: screen('AI特效处理', 'lab', LabFx),
  labFxRun: screen('处理与输出', 'lab', LabFxRun),
  labVoice: screen('声音转音乐', 'lab', LabVoice),
  labVoiceResult: screen('转换结果', 'lab', LabVoiceResult),
  labPicture: screen('图片转音乐', 'lab', LabPicture),
  labPictureAlbum: screen('合集播放', 'lab', LabPictureAlbum),
  postDetail: screen('作品详情', 'community', PostDetail),
  groupDetail: screen('小组详情', 'community', GroupDetail),
  friendDiscover: screen('发现乐友', 'community', FriendDiscover),
  chat: screen('聊天', 'community', Chat),
  instrumentCategory: screen('乐器列表', 'instrument', InstrumentCategory),
  instrumentPlay: screen('体验与创作', 'instrument', InstrumentPlay),
  theoryLesson: screen('课程详情', 'instrument', TheoryLesson),
  knowledgeResult: screen('术语查询', 'instrument', KnowledgeResult),
}
