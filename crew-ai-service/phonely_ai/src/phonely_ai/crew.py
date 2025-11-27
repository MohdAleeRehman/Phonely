from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List

@CrewBase
class PhonelyAi():
    """PhonelyAi crew - AI-powered phone inspection system"""

    agents: List[BaseAgent]
    tasks: List[Task]

    @agent
    def vision_agent(self) -> Agent:
        """Expert phone condition assessor with GPT-5.1 Vision"""
        return Agent(
            config=self.agents_config['vision_agent'], # type: ignore[index]
            verbose=True,
            allow_delegation=False
        )

    @agent
    def text_agent(self) -> Agent:
        """Product description quality analyst with GPT-5.1"""
        return Agent(
            config=self.agents_config['text_agent'], # type: ignore[index]
            verbose=True,
            allow_delegation=False
        )

    @agent
    def pricing_agent(self) -> Agent:
        """Market analyst and pricing strategist with GPT-5.1"""
        return Agent(
            config=self.agents_config['pricing_agent'], # type: ignore[index]
            verbose=True,
            allow_delegation=False
        )

    @task
    def vision_analysis_task(self) -> Task:
        """Analyze phone images for condition, issues, and authenticity"""
        return Task(
            config=self.tasks_config['vision_analysis_task'], # type: ignore[index]
        )

    @task
    def text_analysis_task(self) -> Task:
        """Evaluate product description quality and completeness"""
        return Task(
            config=self.tasks_config['text_analysis_task'], # type: ignore[index]
        )

    @task
    def pricing_analysis_task(self) -> Task:
        """Determine fair market pricing based on all analysis"""
        return Task(
            config=self.tasks_config['pricing_analysis_task'], # type: ignore[index]
        )

    @crew
    def crew(self) -> Crew:
        """Creates the PhonelyAi inspection crew"""
        return Crew(
            agents=self.agents,  # Vision, Text, Pricing agents
            tasks=self.tasks,    # Sequential: Vision → Text → Pricing
            process=Process.sequential,  # Run tasks in order
            verbose=True,
        )
