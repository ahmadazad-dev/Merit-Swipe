from agent import run_agent

while True:

    user = input("\nUser: ")

    if user == "exit":
        break

    result = run_agent(user)

    print("\nAgent:", result)
