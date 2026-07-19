"use client"

import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"
import { useEffect, useState } from "react"
import type { Profile, Experience, Education, Skill, Project, Certification } from "@/types"

export function useProfile() {
  const { user } = useAuth()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [experience, setExperience] = useState<Experience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (profileData) {
        setProfile(profileData)

        const { data: expData } = await supabase
          .from("experience").select("*").eq("profile_id", profileData.id)
        setExperience(expData || [])

        const { data: eduData } = await supabase
          .from("education").select("*").eq("profile_id", profileData.id)
        setEducation(eduData || [])

        const { data: skillData } = await supabase
          .from("skills").select("*").eq("profile_id", profileData.id)
        setSkills(skillData || [])

        const { data: projectData } = await supabase
          .from("projects").select("*").eq("profile_id", profileData.id)
        setProjects(projectData || [])

        const { data: certData } = await supabase
          .from("certifications").select("*").eq("profile_id", profileData.id)
        setCertifications(certData || [])
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return
    await supabase.from("profiles").update(updates).eq("id", profile.id)
    setProfile({ ...profile, ...updates })
  }

  const addExperience = async (exp: Omit<Experience, "id" | "profile_id" | "created_at">) => {
    if (!profile) return
    const { data } = await supabase.from("experience").insert({ ...exp, profile_id: profile.id }).select().single()
    if (data) setExperience([...experience, data])
  }

  const addEducation = async (edu: Omit<Education, "id" | "profile_id" | "created_at">) => {
    if (!profile) return
    const { data } = await supabase.from("education").insert({ ...edu, profile_id: profile.id }).select().single()
    if (data) setEducation([...education, data])
  }

  const addSkill = async (skill: Omit<Skill, "id" | "profile_id">) => {
    if (!profile) return
    const { data } = await supabase.from("skills").insert({ ...skill, profile_id: profile.id }).select().single()
    if (data) setSkills([...skills, data])
  }

  const removeSkill = async (id: string) => {
    await supabase.from("skills").delete().eq("id", id)
    setSkills(skills.filter(s => s.id !== id))
  }

  return {
    profile, experience, education, skills, projects, certifications,
    loading, updateProfile, addExperience, addEducation, addSkill, removeSkill,
  }
}
