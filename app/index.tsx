import { Stack, Link } from "expo-router";

import { ButtonN } from "~/components/Button";
import { Container } from "~/components/Container";
import { ScreenContent } from "~/components/ScreenContent";

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: "Home" }} />
      <Container>
        <ScreenContent path="app/index.tsx" title="Home" />
        <ButtonN title="Maklo" onPress={() => alert("test")}>
          Plain
        </ButtonN>
        <Link href={{ pathname: "/details", params: { name: "Dan" } }} asChild>
          <ButtonN title="ASd" />
        </Link>
      </Container>
    </>
  );
}
