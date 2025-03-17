import { Stack, Link } from "expo-router";

import { Button } from "~/components/Button";
import { Container } from "~/components/Container";
import { ScreenContent } from "~/components/ScreenContent";

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: "Home" }} />
      <Container>
        <ScreenContent path="app/index.tsx" title="Home" />
        <Button title="Plain" onPress={() => alert("test")}>
          Plain
        </Button>
        <Link href={{ pathname: "/details", params: { name: "Dan" } }} asChild>
          <Button title="Show Details" />
        </Link>
      </Container>
    </>
  );
}
